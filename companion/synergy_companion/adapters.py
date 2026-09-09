from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable

MAX_JOB_OUTPUT = 24_000
SECRET_PATTERNS = (
    re.compile(r"sk-[A-Za-z0-9_-]{12,}"),
    re.compile(r"(?i)(access_token|refresh_token|authorization|bearer)(\s*[:=]\s*)[^\s,}]+"),
    re.compile(r"eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
)


def sanitize_output(value: str) -> str:
    sanitized = value
    for pattern in SECRET_PATTERNS:
        if pattern.groups >= 2:
            sanitized = pattern.sub(lambda match: f"{match.group(1)}{match.group(2)}[redacted]", sanitized)
        else:
            sanitized = pattern.sub("[redacted]", sanitized)
    return sanitized[-MAX_JOB_OUTPUT:]


def run_readonly(args: list[str], timeout: float = 12) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=timeout,
        check=False,
    )


class AdapterError(RuntimeError):
    pass


class ProviderAdapter:
    id: str
    label: str
    binary: str

    @property
    def installed(self) -> bool:
        return shutil.which(self.binary) is not None

    def providers(self) -> list[dict[str, str]]:
        raise NotImplementedError

    def auth_command(self, provider: str) -> list[str]:
        raise NotImplementedError

    def status(self, provider: str | None = None) -> dict[str, Any]:
        raise NotImplementedError

    def descriptor(self) -> dict[str, Any]:
        providers: list[dict[str, str]] = []
        error = None
        if self.installed:
            try:
                providers = self.providers()
            except Exception as caught:  # provider CLI is an external boundary
                error = str(caught)
        return {
            "id": self.id,
            "label": self.label,
            "installed": self.installed,
            "providers": providers,
            "error": error,
        }

    def require_provider(self, provider: str) -> str:
        normalized = provider.strip().lower()
        allowed = {item["id"] for item in self.providers()}
        if normalized not in allowed:
            raise AdapterError(f"Provider {normalized!r} is not supported by {self.label}.")
        return normalized


class OmpAdapter(ProviderAdapter):
    id = "omp"
    label = "Oh My Pi"
    binary = "omp"

    def providers(self) -> list[dict[str, str]]:
        result = run_readonly([self.binary, "auth-broker", "list", "--json"])
        if result.returncode != 0:
            raise AdapterError(sanitize_output(result.stdout) or "OMP provider discovery failed.")
        payload = json.loads(result.stdout)
        return [
            {"id": str(item["id"]), "label": str(item["name"])}
            for item in payload
            if isinstance(item, dict) and item.get("id") and item.get("name")
        ]

    def auth_command(self, provider: str) -> list[str]:
        return [self.binary, "auth-broker", "login", self.require_provider(provider)]

    def status(self, provider: str | None = None) -> dict[str, Any]:
        if provider:
            normalized = self.require_provider(provider)
            result = run_readonly([self.binary, "token", normalized, "--list"])
        else:
            result = run_readonly([self.binary, "auth-broker", "status", "--json"])
        return {
            "ok": result.returncode == 0,
            "output": sanitize_output(result.stdout).strip(),
        }


class HermesAdapter(ProviderAdapter):
    id = "hermes"
    label = "Hermes Agent"
    binary = "hermes"
    OAUTH_PROVIDERS = (
        ("anthropic", "Anthropic / Claude Code OAuth"),
        ("nous", "Nous Portal subscription"),
        ("openai-codex", "ChatGPT Codex subscription"),
        ("xai-oauth", "xAI Grok OAuth"),
        ("qwen-oauth", "Qwen OAuth through Qwen CLI"),
        ("minimax-oauth", "MiniMax OAuth"),
    )

    def providers(self) -> list[dict[str, str]]:
        return [{"id": provider, "label": label} for provider, label in self.OAUTH_PROVIDERS]

    def auth_command(self, provider: str) -> list[str]:
        normalized = self.require_provider(provider)
        return [
            self.binary,
            "auth",
            "add",
            normalized,
            "--type",
            "oauth",
            "--label",
            f"synergy-{normalized}",
        ]

    def status(self, provider: str | None = None) -> dict[str, Any]:
        args = [self.binary, "auth", "status", self.require_provider(provider)] if provider else [
            self.binary,
            "auth",
            "list",
        ]
        result = run_readonly(args)
        return {
            "ok": result.returncode == 0,
            "output": sanitize_output(result.stdout).strip(),
        }


ADAPTERS: dict[str, ProviderAdapter] = {
    "omp": OmpAdapter(),
    "hermes": HermesAdapter(),
}


@dataclass
class Job:
    id: str
    adapter: str = ""
    provider: str = ""
    kind: str = "auth"
    status: str = "pending"
    output: str = ""
    returncode: int | None = None
    created_at: float = field(default_factory=time.time)
    completed_at: float | None = None
    result: dict[str, Any] | None = None
    process: subprocess.Popen[str] | None = field(default=None, repr=False)

    def public(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind,
            "adapter": self.adapter,
            "provider": self.provider,
            "status": self.status,
            "output": self.output,
            "returncode": self.returncode,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
            "result": self.result,
        }


class JobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.RLock()

    @property
    def busy(self) -> bool:
        with self._lock:
            return any(
                job.kind in {"claim", "run", "verify"} and job.status in {"pending", "running"}
                for job in self._jobs.values()
            )

    def start_auth(self, adapter_id: str, provider: str) -> Job:
        adapter = ADAPTERS.get(adapter_id)
        if not adapter:
            raise AdapterError("Unknown provider adapter.")
        if not adapter.installed:
            raise AdapterError(f"{adapter.label} is not installed on this device.")
        command = adapter.auth_command(provider)
        job = Job(id=uuid.uuid4().hex, adapter=adapter_id, provider=provider)
        self._store(job)
        threading.Thread(target=self._run_auth, args=(job, command), daemon=True).start()
        return job


    def start_loop(self, kind: str, runner: Callable[[Job], dict[str, Any]]) -> Job:
        if kind not in {"claim", "run", "verify"}:
            raise ValueError("Unknown loop job kind.")
        with self._lock:
            if self.busy:
                raise AdapterError("A loop job is already running.")
            job = Job(id=uuid.uuid4().hex, kind=kind)
            self._jobs[job.id] = job
        threading.Thread(target=self._run_loop, args=(job, runner), daemon=True).start()
        return job

    def _store(self, job: Job) -> None:
        with self._lock:
            self._jobs[job.id] = job

    def get(self, job_id: str) -> Job | None:
        with self._lock:
            return self._jobs.get(job_id)

    def cancel(self, job_id: str) -> bool:
        job = self.get(job_id)
        if not job or job.status not in {"pending", "running"}:
            return False
        process = job.process
        if process and process.poll() is None:
            os.killpg(os.getpgid(process.pid), 15)
        job.status = "cancelled"
        job.returncode = -15
        job.completed_at = time.time()
        return True

    def _run_auth(self, job: Job, command: list[str]) -> None:
        if job.status == "cancelled":
            return
        job.status = "running"
        try:
            process = subprocess.Popen(
                command,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                start_new_session=True,
            )
            job.process = process
            output = ""
            assert process.stdout is not None
            for line in process.stdout:
                output = (output + line)[-(MAX_JOB_OUTPUT * 2):]
                job.output = sanitize_output(output)
            job.returncode = process.wait()
            if job.status != "cancelled":
                job.status = "completed" if job.returncode == 0 else "failed"
        except Exception as error:
            job.output = sanitize_output(str(error))
            job.returncode = -1
            job.status = "failed"
        finally:
            job.process = None
            job.completed_at = job.completed_at or time.time()

    def _run_loop(self, job: Job, runner: Callable[[Job], dict[str, Any]]) -> None:
        if job.status == "cancelled":
            return
        job.status = "running"
        try:
            job.result = runner(job)
            job.returncode = 0
            if job.status != "cancelled":
                job.status = "completed"
        except Exception as error:
            job.output = sanitize_output(str(error))
            job.returncode = -1
            if job.status != "cancelled":
                job.status = "failed"
        finally:
            job.process = None
            job.completed_at = job.completed_at or time.time()


