from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
from collections import deque
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from platformdirs import user_data_path

from .adapters import AdapterError, Job, MAX_JOB_OUTPUT, run_readonly, sanitize_output

TASK_REPO = "kvnloo/synergy-tasks"
HARNESSES = {
    "codex": ("Codex", "codex"),
    "hermes": ("Hermes Agent", "hermes"),
    "omp": ("Oh My Pi", "omp"),
    "claude": ("Claude Code", "claude"),
}
DEFAULT_LEASE_HOURS = 72
MAX_LEASE_HOURS = 168
DEFAULT_MAX_MINUTES = 45
WORK_ROOT = user_data_path("synergy-companion", "Synergy") / "work"
_CLAIM_TIMES: deque[float] = deque()
_CLAIM_MARKER = re.compile(r"<!-- synergy-claim (\{.*?\}) -->")


def scrubbed_env() -> dict[str, str]:
    allowed = {"PATH", "HOME", "LANG", "LC_ALL"}
    result = {
        key: value
        for key, value in os.environ.items()
        if (key in allowed or key.startswith("XDG_"))
        and not any(secret in key.upper() for secret in ("TOKEN", "KEY", "SECRET"))
    }
    result.update({
        "TERM": "dumb",
        "CI": "1",
        "NO_COLOR": "1",
        "GIT_TERMINAL_PROMPT": "0",
        "GH_PROMPT_DISABLED": "1",
        "GH_NO_UPDATE_NOTIFIER": "1",
    })
    return result


def _readonly(args: list[str], *, timeout: float = 30) -> str:
    result = run_readonly(args, timeout=timeout)
    output = sanitize_output(result.stdout).strip()
    if result.returncode:
        raise AdapterError(output or f"{args[0]} failed with exit code {result.returncode}.")
    return output


def identity() -> dict[str, Any]:
    gh_installed = shutil.which("gh") is not None
    authenticated = False
    login = None
    if gh_installed:
        version = run_readonly(["gh", "--version"])
        gh_installed = version.returncode == 0
        if gh_installed:
            authenticated = run_readonly(["gh", "auth", "status"]).returncode == 0
            if authenticated:
                result = run_readonly(["gh", "api", "user", "--jq", ".login"])
                if result.returncode == 0:
                    login = result.stdout.strip() or None
    return {
        "gh_installed": gh_installed,
        "authenticated": authenticated,
        "login": login,
        "harnesses": [
            {"id": harness, "label": label, "installed": shutil.which(binary) is not None}
            for harness, (label, binary) in HARNESSES.items()
        ],
        "busy": False,
    }


def _validate_issue(issue: Any) -> int:
    if isinstance(issue, bool):
        raise ValueError("Issue must be a positive integer.")
    try:
        number = int(issue)
    except (TypeError, ValueError) as error:
        raise ValueError("Issue must be a positive integer.") from error
    if number <= 0:
        raise ValueError("Issue must be a positive integer.")
    return number


def claim(job: Job, issue: Any, scope: str, harness: str, hours: Any = DEFAULT_LEASE_HOURS) -> dict[str, Any]:
    number = _validate_issue(issue)
    scope = str(scope).strip()
    if not scope or len(scope) > 200:
        raise ValueError("Scope must be one sentence of at most 200 characters.")
    harness = str(harness).strip().lower()
    if harness not in {*HARNESSES, "manual"}:
        raise ValueError("Unknown harness.")
    try:
        lease_hours = int(hours)
    except (TypeError, ValueError) as error:
        raise ValueError("Lease hours must be an integer.") from error
    if not 1 <= lease_hours <= MAX_LEASE_HOURS:
        raise ValueError(f"Lease hours must be between 1 and {MAX_LEASE_HOURS}.")

    now_epoch = time.time()
    while _CLAIM_TIMES and _CLAIM_TIMES[0] <= now_epoch - 86400:
        _CLAIM_TIMES.popleft()
    if len(_CLAIM_TIMES) >= 3:
        raise AdapterError("Claim limit reached for today.")

    raw = _readonly([
        "gh", "api", f"repos/{TASK_REPO}/issues/{number}",
        "--jq", "{state,labels:[.labels[].name],title}",
    ])
    try:
        issue_data = json.loads(raw)
    except json.JSONDecodeError as error:
        raise AdapterError("GitHub returned an invalid task response.") from error
    labels = issue_data.get("labels", [])
    if issue_data.get("state") != "open" or "claimable" not in labels or "claimed" in labels:
        raise AdapterError("Task is not claimable right now.")

    base_revision = _readonly(["gh", "api", f"repos/{TASK_REPO}/commits/main", "--jq", ".sha"])
    claimed_at = datetime.now(timezone.utc).replace(microsecond=0)
    expires_at = claimed_at + timedelta(hours=lease_hours)
    login = _readonly(["gh", "api", "user", "--jq", ".login"])
    body = "\n".join([
        "```yaml", "# verified-oss-loop claim", f"issue: {number}", f"claimant: {login}",
        f"base_revision: {base_revision}", f"claimed_at: {claimed_at.isoformat().replace('+00:00', 'Z')}",
        f"expires_at: {expires_at.isoformat().replace('+00:00', 'Z')}", f"scope: {json.dumps(scope)}",
        "work_url: pending", f"harness: {harness}", "```",
    ])
    completed = subprocess.run(
        ["gh", "issue", "comment", str(number), "--repo", TASK_REPO, "--body-file", "-"],
        input=body, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
        env=scrubbed_env(), check=False,
    )
    if completed.returncode:
        raise AdapterError(sanitize_output(completed.stdout).strip() or "GitHub comment failed.")
    _CLAIM_TIMES.append(now_epoch)
    return {
        "comment_url": completed.stdout.strip().splitlines()[-1],
        "expires_at": expires_at.isoformat().replace("+00:00", "Z"),
        "base_revision": base_revision,
    }


def _run_process(job: Job, args: list[str], cwd: Path, *, stdin: str | None = None, timeout: int = 60) -> float:
    started = time.monotonic()
    process = subprocess.Popen(
        args, cwd=cwd, env=scrubbed_env(), stdin=subprocess.PIPE if stdin is not None else subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, start_new_session=True,
    )
    job.process = process
    output: list[str] = []

    def consume() -> None:
        assert process.stdout is not None
        for line in process.stdout:
            output.append(line)
            if sum(map(len, output)) > MAX_JOB_OUTPUT * 2:
                output[:] = ["".join(output)[-MAX_JOB_OUTPUT * 2:]]
            job.output = sanitize_output("".join(output))

    reader = threading.Thread(target=consume, daemon=True)
    reader.start()
    if stdin is not None:
        assert process.stdin is not None
        process.stdin.write(stdin)
        process.stdin.close()
    try:
        process.wait(timeout=timeout)
    except subprocess.TimeoutExpired as error:
        os.killpg(os.getpgid(process.pid), 15)
        process.wait()
        reader.join(timeout=2)
        raise AdapterError(f"Harness timed out after {timeout // 60} minutes.\n{job.output}") from error
    finally:
        job.process = None
    reader.join(timeout=2)
    if process.returncode:
        raise AdapterError(job.output.strip() or f"{args[0]} failed with exit code {process.returncode}.")
    return time.monotonic() - started


def _git(args: list[str], cwd: Path, *, allow_failure: bool = False) -> str:
    result = subprocess.run(["git", *args], cwd=cwd, env=scrubbed_env(), stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT, text=True, check=False)
    output = sanitize_output(result.stdout).strip()
    if result.returncode and not allow_failure:
        raise AdapterError(output or "Git command failed.")
    return output


def _current_claim(number: int) -> tuple[str, str]:
    login = _readonly(["gh", "api", "user", "--jq", ".login"])
    issue_raw = _readonly(["gh", "api", f"repos/{TASK_REPO}/issues/{number}", "--jq", "{state,labels:[.labels[].name]}"])
    issue_data = json.loads(issue_raw)
    if issue_data.get("state") != "open" or "claimed" not in issue_data.get("labels", []):
        raise AdapterError("Claim this task first.")
    comments_raw = _readonly(["gh", "api", f"repos/{TASK_REPO}/issues/{number}/comments?per_page=100", "--jq", ".[].[.body] | @json"])
    marker = None
    for line in comments_raw.splitlines():
        try:
            body = json.loads(line)
            body = body[0] if isinstance(body, list) else body
        except json.JSONDecodeError:
            body = line
        matches = _CLAIM_MARKER.findall(str(body))
        if matches:
            marker = json.loads(matches[-1])
    if not marker or marker.get("claimant") != login:
        raise AdapterError("Claim this task first.")
    return login, str(marker.get("scope") or f"Complete issue {number}")


def run(job: Job, issue: Any, harness: str, task_markdown: str, max_minutes: Any = DEFAULT_MAX_MINUTES,
        *, work_root: Path = WORK_ROOT) -> dict[str, Any]:
    number = _validate_issue(issue)
    harness = str(harness).strip().lower()
    if harness not in HARNESSES:
        raise ValueError("Unknown harness.")
    binary = HARNESSES[harness][1]
    if shutil.which(binary) is None:
        raise AdapterError(f"{HARNESSES[harness][0]} is not installed on this device.")
    try:
        minutes = int(max_minutes)
    except (TypeError, ValueError) as error:
        raise ValueError("Maximum minutes must be an integer.") from error
    if minutes < 1:
        raise ValueError("Maximum minutes must be positive.")
    login, scope = _current_claim(number)

    workspace = Path(work_root).expanduser().resolve() / f"{number}-{datetime.now(timezone.utc):%Y%m%d%H%M%S}"
    repo = workspace / "repo"
    workspace.mkdir(parents=True, exist_ok=False)
    subprocess.run(["gh", "repo", "fork", TASK_REPO, "--clone=false"], env=scrubbed_env(),
                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
    _git(["clone", "--depth", "50", f"https://github.com/{login}/synergy-tasks", str(repo)], workspace)
    _git(["remote", "add", "upstream", f"https://github.com/{TASK_REPO}"], repo)
    _git(["fetch", "upstream", "main"], repo)
    branch = f"task-{number}-{login}"
    _git(["checkout", "-b", branch, "upstream/main"], repo)
    task_path = repo / "contributions" / str(number) / "TASK.md"
    task_path.parent.mkdir(parents=True, exist_ok=True)
    task_path.write_text(str(task_markdown), encoding="utf-8")

    if harness == "codex":
        command = [binary, "exec", "--cd", str(repo), "--sandbox", "workspace-write", "-o", str(workspace / "last-message.md"), "-"]
        stdin = str(task_markdown)
    elif harness == "hermes":
        command, stdin = [binary, "-z", str(task_markdown), "--in", str(repo)], None
    elif harness == "omp":
        command, stdin = [binary, "-p", "--cwd", str(repo), "--mode", "text", "--auto-approve", str(task_markdown)], None
    else:
        command, stdin = [binary, "-p", str(task_markdown), "--permission-mode", "acceptEdits"], None
    wall_seconds = _run_process(job, command, repo, stdin=stdin, timeout=minutes * 60)

    _git(["add", "-A"], repo)
    staged = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=repo, env=scrubbed_env(), check=False)
    if staged.returncode == 0:
        return {"branch": branch, "head_revision": _git(["rev-parse", "HEAD"], repo), "pr_url": None,
                "workspace": str(workspace), "note": "Harness produced no changes."}
    _git(["commit", "-m", f"Task #{number}: {scope}"], repo)
    _git(["push", "-u", "origin", branch], repo)
    head = _git(["rev-parse", "HEAD"], repo)
    changed = _git(["diff", "--name-only", "upstream/main...HEAD"], repo).splitlines()
    policy = _readonly(["gh", "api", f"repos/{TASK_REPO}/commits?path=CONTRIBUTING.md&per_page=1", "--jq", ".[0].sha"])
    receipt = {
        "issue": number, "base_revision": _git(["rev-parse", "upstream/main"], repo), "head_revision": head,
        "changed_files": changed, "policy_revision": policy,
        "tests": {"red": "n/a: research deliverable", "green": "n/a: research deliverable", "sabotage": "n/a"},
        "builds": [], "runtime_evidence": [], "security_checks": [],
        "resource_usage": {"wall_seconds": round(wall_seconds, 3), "tokens": None, "api_cost_estimate": None},
        "limitations": [], "ai_assistance": f"{harness} run by {login} through synergy-worker; human reviewed before submission: no",
    }
    partial = repo / "contributions" / str(number) / "receipt.partial.yaml"
    if partial.is_file():
        try:
            import yaml
            supplied = yaml.safe_load(partial.read_text(encoding="utf-8")) or {}
            for key in ("tests", "builds", "runtime_evidence", "limitations"):
                if key in supplied:
                    receipt[key] = supplied[key]
        except Exception as error:
            raise AdapterError(f"Invalid receipt.partial.yaml: {error}") from error
    import yaml
    body = f"Fixes #{number}\n\n```yaml\n# verified-oss-loop receipt\n{yaml.safe_dump(receipt, sort_keys=False).rstrip()}\n```\n"
    created = subprocess.run(
        ["gh", "pr", "create", "--repo", TASK_REPO, "--base", "main", "--head", f"{login}:{branch}",
         "--title", f"Task #{number}: {scope}", "--body-file", "-"], input=body, env=scrubbed_env(),
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False,
    )
    if created.returncode:
        raise AdapterError(sanitize_output(created.stdout).strip() or "GitHub pull request creation failed.")
    pr_url = created.stdout.strip().splitlines()[-1]
    _readonly(["gh", "issue", "comment", str(number), "--repo", TASK_REPO, "--body", f"work_url: {pr_url}"])
    return {"branch": branch, "head_revision": head, "pr_url": pr_url, "workspace": str(workspace)}


def verify(job: Job, pr: Any, harness: str, *, work_root: Path = WORK_ROOT) -> dict[str, Any]:
    """Independent review lane: checkout a PR, run a read-oriented harness, post a C4 review block."""
    try:
        number = int(pr)
    except (TypeError, ValueError) as error:
        raise ValueError("Pull request number must be a positive integer.") from error
    if number <= 0:
        raise ValueError("Pull request number must be a positive integer.")
    harness = str(harness).strip().lower()
    if harness not in HARNESSES:
        raise ValueError("Unknown harness.")
    binary = HARNESSES[harness][1]
    if shutil.which(binary) is None:
        raise AdapterError(f"{HARNESSES[harness][0]} is not installed on this device.")

    login = _readonly(["gh", "api", "user", "--jq", ".login"])
    pr_json = _readonly([
        "gh", "api", f"repos/{TASK_REPO}/pulls/{number}",
        "--jq", "{user:.user.login,head:.head.sha,url:.html_url,fork:.head.repo.clone_url,ref:.head.ref}",
    ])
    try:
        pr_data = json.loads(pr_json)
    except json.JSONDecodeError as error:
        raise AdapterError("GitHub returned an invalid pull request response.") from error
    author = str(pr_data.get("user") or "")
    if author == login:
        raise AdapterError("Reviewer must not be the author (Verified OSS Loop §6).")
    head = str(pr_data.get("head") or "")
    if not head:
        raise AdapterError("Pull request head revision is missing.")

    prompt = _readonly([
        "gh", "api", f"repos/{TASK_REPO}/contents/docs/REVIEW_PROMPT.md",
        "--jq", ".content",
    ])
    import base64
    try:
        review_prompt = base64.b64decode(prompt.replace("\n", "")).decode("utf-8")
    except Exception as error:
        raise AdapterError(f"Could not load REVIEW_PROMPT.md: {error}") from error

    workspace = Path(work_root).expanduser().resolve() / f"verify-{number}-{datetime.now(timezone.utc):%Y%m%d%H%M%S}"
    repo = workspace / "repo"
    workspace.mkdir(parents=True, exist_ok=False)
    clone_url = pr_data.get("fork") or f"https://github.com/{TASK_REPO}"
    _git(["clone", "--depth", "50", str(clone_url), str(repo)], workspace)
    checkout = subprocess.run(
        ["gh", "pr", "checkout", str(number), "--repo", TASK_REPO],
        cwd=repo, env=scrubbed_env(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False,
    )
    if checkout.returncode:
        raise AdapterError(sanitize_output(checkout.stdout).strip() or "Could not check out the pull request.")

    task = (
        f"{review_prompt.strip()}\n\n"
        f"PR: {pr_data.get('url')}\nHead revision to review: {head}\n"
        "Write verdict.yaml at the repository root with keys verdict, head_revision, notes.\n"
        "Do not merge. Do not push."
    )
    (workspace / "REVIEW_TASK.md").write_text(task, encoding="utf-8")

    if harness == "codex":
        command = [binary, "exec", "--cd", str(repo), "--sandbox", "read-only", "-o", str(workspace / "last-message.md"), "-"]
        stdin = task
    elif harness == "hermes":
        command, stdin = [binary, "-z", task, "--in", str(repo)], None
    elif harness == "omp":
        command, stdin = [binary, "-p", "--cwd", str(repo), "--mode", "text", "--auto-approve", task], None
    else:
        command, stdin = [binary, "-p", task, "--permission-mode", "acceptEdits"], None
    _run_process(job, command, repo, stdin=stdin, timeout=DEFAULT_MAX_MINUTES * 60)

    verdict_path = repo / "verdict.yaml"
    if not verdict_path.is_file():
        raise AdapterError("Harness did not write verdict.yaml.")
    try:
        import yaml
        verdict_data = yaml.safe_load(verdict_path.read_text(encoding="utf-8")) or {}
    except Exception as error:
        raise AdapterError(f"Invalid verdict.yaml: {error}") from error
    verdict = str(verdict_data.get("verdict") or "").strip()
    allowed = {
        "APPROVE_EXACT_HEAD",
        "CHANGES_REQUIRED",
        "DISCARD_DUPLICATE",
        "DISCARD_WRONG_DIRECTION",
        "BLOCKED_EXTERNAL",
    }
    if verdict not in allowed:
        raise AdapterError(f"Unsupported verdict: {verdict or '(empty)'}")
    reviewed_head = str(verdict_data.get("head_revision") or head).strip() or head
    notes = str(verdict_data.get("notes") or "Independent review completed.").strip()
    body = "\n".join([
        "```yaml",
        "# verified-oss-loop review",
        f"verdict: {verdict}",
        f"head_revision: {reviewed_head}",
        f"notes: {json.dumps(notes)}",
        "```",
    ])
    posted = subprocess.run(
        ["gh", "pr", "comment", str(number), "--repo", TASK_REPO, "--body-file", "-"],
        input=body, env=scrubbed_env(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False,
    )
    if posted.returncode:
        raise AdapterError(sanitize_output(posted.stdout).strip() or "Could not post review comment.")
    comment_url = posted.stdout.strip().splitlines()[-1] if posted.stdout.strip() else pr_data.get("url")
    return {"verdict": verdict, "comment_url": comment_url, "head_revision": reviewed_head}
