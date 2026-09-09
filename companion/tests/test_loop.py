import os
import subprocess
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from synergy_companion.adapters import AdapterError, Job, JobManager
from synergy_companion.loop import TASK_REPO, claim, run, scrubbed_env, verify


class LoopTests(unittest.TestCase):
    def test_loop_claim_rejects_unclaimable(self):
        responses = [
            subprocess.CompletedProcess([], 0, '{"state":"open","labels":["task"],"title":"Task"}'),
        ]
        with patch("synergy_companion.loop.run_readonly", side_effect=responses):
            with self.assertRaisesRegex(AdapterError, "not claimable"):
                claim(Job("job"), 12, "Verify the evidence", "codex", 72)

    def test_loop_repo_not_overridable(self):
        calls = []

        def fake_readonly(args, timeout=30):
            calls.append(args)
            if "/issues/12" in " ".join(args):
                return subprocess.CompletedProcess(args, 0, '{"state":"open","labels":["claimable"],"title":"Task"}')
            if args[-1] == ".login":
                return subprocess.CompletedProcess(args, 0, "kvnloo\n")
            return subprocess.CompletedProcess(args, 0, "abc123\n")

        posted = subprocess.CompletedProcess([], 0, "https://github.com/kvnloo/synergy-tasks/issues/12#issuecomment-1\n")
        with patch("synergy_companion.loop.run_readonly", side_effect=fake_readonly), \
             patch("synergy_companion.loop.subprocess.run", return_value=posted):
            claim(Job("job"), 12, "Bounded scope", "manual", 72)
        flattened = " ".join(item for call in calls for item in call)
        self.assertIn(TASK_REPO, flattened)
        self.assertNotIn("evil/repo", flattened)

    def test_scrubbed_env_drops_secrets(self):
        with patch.dict(os.environ, {
            "PATH": "/bin", "HOME": "/tmp/home", "SYNERGY_VAULT_PASSPHRASE": "secret",
            "OPENAI_API_KEY": "secret", "XDG_CONFIG_HOME": "/tmp/config",
        }, clear=True):
            environment = scrubbed_env()
        self.assertEqual(environment["PATH"], "/bin")
        self.assertEqual(environment["XDG_CONFIG_HOME"], "/tmp/config")
        self.assertNotIn("SYNERGY_VAULT_PASSPHRASE", environment)
        self.assertNotIn("OPENAI_API_KEY", environment)

    def test_run_requires_claim_by_login(self):
        responses = [
            subprocess.CompletedProcess([], 0, "kvnloo\n"),
            subprocess.CompletedProcess([], 0, '{"state":"open","labels":["claimed"]}'),
            subprocess.CompletedProcess([], 0, '<!-- synergy-claim {"claimant":"someone-else"} -->'),
        ]
        with patch("synergy_companion.loop.shutil.which", return_value="/usr/bin/codex"), \
             patch("synergy_companion.loop.run_readonly", side_effect=responses):
            with self.assertRaisesRegex(AdapterError, "Claim this task first"):
                run(Job("job"), 12, "codex", "Do the task", 1)


    def test_verify_rejects_self_review(self):
        responses = [
            subprocess.CompletedProcess([], 0, "kvnloo\n"),
            subprocess.CompletedProcess([], 0, '{"user":"kvnloo","head":"abc","url":"https://example/pr/1","fork":"https://github.com/x/y","ref":"branch"}'),
        ]
        with patch("synergy_companion.loop.shutil.which", return_value="/usr/bin/codex"), \
             patch("synergy_companion.loop.run_readonly", side_effect=responses):
            with self.assertRaisesRegex(AdapterError, "must not be the author"):
                verify(Job("job"), 1, "codex")
    def test_cancel_kills_process_group(self):
        manager = JobManager()
        process = subprocess.Popen(["sleep", "30"], start_new_session=True)
        self.addCleanup(lambda: process.poll() is None and process.kill())
        job = Job("running", kind="run", status="running", process=process)
        manager._jobs[job.id] = job
        self.assertTrue(manager.cancel(job.id))
        process.wait(timeout=2)
        self.assertEqual(job.status, "cancelled")
        self.assertEqual(process.returncode, -15)


if __name__ == "__main__":
    unittest.main()
