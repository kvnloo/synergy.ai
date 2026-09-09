from __future__ import annotations

import hmac
import json
import mimetypes
mimetypes.add_type("application/manifest+json", ".webmanifest")
import subprocess
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError
from pathlib import Path
from urllib.request import Request, urlopen

from . import __version__
from .adapters import ADAPTERS, AdapterError, JobManager, sanitize_output
from .loop import DEFAULT_MAX_MINUTES, WORK_ROOT, claim, identity, run, verify
from .vault import EncryptedVault, VaultError

MAX_REQUEST_BYTES = 256 * 1024


class CompanionServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(
        self,
        address: tuple[str, int],
        vault: EncryptedVault,
        allowed_origins: set[str],
        site_root: Path | None = None,
        loop_config: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(address, CompanionHandler)
        self.vault = vault
        self.allowed_origins = allowed_origins
        self.jobs = JobManager()
        self.site_root = site_root
        self.loop_config = {
            "max_minutes": DEFAULT_MAX_MINUTES,
            "work_root": WORK_ROOT,
            **(loop_config or {}),
        }


class CompanionHandler(BaseHTTPRequestHandler):
    server: CompanionServer
    protocol_version = "HTTP/1.1"

    def log_message(self, format_string: str, *args: object) -> None:
        # Do not log paths, request bodies, pairing tokens, or provider output.
        print(f"[synergy-companion] {self.command} -> {args[1] if len(args) > 1 else '-'}")

    def _origin(self) -> str | None:
        return self.headers.get("Origin")

    def _origin_allowed(self) -> bool:
        origin = self._origin()
        if origin:
            return origin in self.server.allowed_origins
        return self.headers.get("Sec-Fetch-Site") == "same-origin"

    def _host_allowed(self) -> bool:
        hostname = urlparse(f"//{self.headers.get('Host', '')}").hostname
        return hostname in {"127.0.0.1", "localhost"}

    def _authorized(self) -> bool:
        supplied = self.headers.get("Authorization", "")
        expected = f"Bearer {self.server.vault.pairing_token}"
        return hmac.compare_digest(supplied, expected)

    def _security_headers(self) -> None:
        origin = self._origin()
        if origin and origin in self.server.allowed_origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        self.send_header("X-Content-Type-Options", "nosniff")

    def _json(self, status: int, payload: dict[str, Any] | list[Any]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self._security_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status: int, message: str) -> None:
        self._json(status, {"error": message})

    def _guard(self, require_auth: bool = True) -> bool:
        if not self._host_allowed():
            self._error(HTTPStatus.BAD_REQUEST, "Invalid Host header.")
            return False
        if not self._origin_allowed():
            self._error(HTTPStatus.FORBIDDEN, "Origin is not allowed.")
            return False
        if require_auth and not self._authorized():
            self._error(HTTPStatus.UNAUTHORIZED, "Pairing token is missing or invalid.")
            return False
        return True

    def _read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid Content-Length.") from error
        if length <= 0 or length > MAX_REQUEST_BYTES:
            raise ValueError("Request body is empty or too large.")
        body = self.rfile.read(length)
        try:
            payload = json.loads(body)
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValueError("Request body must be valid JSON.") from error
        if not isinstance(payload, dict):
            raise ValueError("Request body must be a JSON object.")
        return payload

    def do_OPTIONS(self) -> None:
        if not self._host_allowed() or not self._origin_allowed():
            self._error(HTTPStatus.FORBIDDEN, "Origin is not allowed.")
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self._security_headers()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _serve_site(self, path: str) -> bool:
        if path == "/app":
            self.send_response(HTTPStatus.PERMANENT_REDIRECT)
            self.send_header("Location", "/app/")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return True
        files = {
            "/app/": "index.html",
            "/app/app.js": "app.js",
            "/app/content.js": "content.js",
            "/app/styles.css": "styles.css",
            "/app/favicon.svg": "favicon.svg",
            "/app/companion-bot.js": "companion-bot.js",
            "/app/board.js": "board.js",
            "/app/recall.js": "recall.js",
            "/app/trust.js": "trust.js",
            "/app/perspectives.js": "perspectives.js",
            "/app/sw.js": "sw.js",
            "/app/manifest.webmanifest": "manifest.webmanifest",
            "/app/data/board.json": "data/board.json",
        }
        relative = files.get(path)
        if not relative:
            return False
        if not self._host_allowed() or not self.server.site_root:
            self._error(HTTPStatus.NOT_FOUND, "Local reader is unavailable.")
            return True
        source = self.server.site_root / relative
        try:
            body = source.read_bytes()
        except OSError:
            self._error(HTTPStatus.NOT_FOUND, "Local reader asset is unavailable.")
            return True
        media_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{media_type}; charset=utf-8" if media_type.startswith("text/") or media_type in {"application/javascript", "image/svg+xml"} else media_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)
        return True

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if self._serve_site(path):
            return
        if path == "/v1/health":
            if not self._guard(require_auth=False):
                return
            self._json(HTTPStatus.OK, {"name": "Synergy Local Companion", "version": __version__})
            return
        if not self._guard():
            return
        if path == "/v1/loop/identity":
            try:
                payload = identity()
                payload["busy"] = self.server.jobs.busy
                self._json(HTTPStatus.OK, payload)
            except (AdapterError, subprocess.SubprocessError) as error:
                self._error(HTTPStatus.BAD_GATEWAY, sanitize_output(str(error)))
            return

        if path == "/v1/adapters":
            self._json(HTTPStatus.OK, [adapter.descriptor() for adapter in ADAPTERS.values()])
            return
        if path.startswith("/v1/adapters/") and path.endswith("/status"):
            parts = path.strip("/").split("/")
            adapter = ADAPTERS.get(parts[2]) if len(parts) == 4 else None
            if not adapter:
                self._error(HTTPStatus.NOT_FOUND, "Adapter not found.")
                return
            try:
                self._json(HTTPStatus.OK, adapter.status())
            except (AdapterError, subprocess.SubprocessError) as error:
                self._error(HTTPStatus.BAD_GATEWAY, str(error))
            return
        if path.startswith("/v1/jobs/"):
            job = self.server.jobs.get(path.rsplit("/", 1)[-1])
            if not job:
                self._error(HTTPStatus.NOT_FOUND, "Job not found.")
                return
            self._json(HTTPStatus.OK, job.public())
            return
        if path == "/v1/credentials":
            self._json(HTTPStatus.OK, self.server.vault.list_credentials())
            return
        self._error(HTTPStatus.NOT_FOUND, "Route not found.")

    def _proxy_openrouter(self, payload: dict[str, Any]) -> None:
        credential_id = str(payload.get("credential_id") or "")
        credential = next(
            (item for item in self.server.vault.list_credentials() if item.get("id") == credential_id),
            None,
        )
        if not credential or credential.get("provider") != "openrouter":
            raise ValueError("An encrypted OpenRouter credential is required.")
        model = str(payload.get("model") or "").strip()
        messages = payload.get("messages")
        if not model or not isinstance(messages, list) or not messages:
            raise ValueError("Model and messages are required.")
        outbound = json.dumps({
            "model": model,
            "messages": messages,
            "temperature": payload.get("temperature", 0.2),
        }).encode("utf-8")
        request = Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=outbound,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.server.vault.get_secret(credential_id)}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://kvnloo.github.io/synergy.ai/",
                "X-Title": "Synergy Evidence Briefs",
            },
        )
        try:
            with urlopen(request, timeout=90) as response:
                body = response.read(2 * 1024 * 1024)
                result = json.loads(body)
                self._json(response.status, result)
        except HTTPError as error:
            body = error.read(256 * 1024)
            try:
                result = json.loads(body)
            except (UnicodeDecodeError, json.JSONDecodeError):
                result = {"error": f"OpenRouter returned {error.code}."}
            self._json(error.code, result)
        except (URLError, TimeoutError) as error:
            self._error(HTTPStatus.BAD_GATEWAY, f"OpenRouter request failed: {error.reason if isinstance(error, URLError) else error}")

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if not self._guard():
            return
        if path.startswith("/v1/jobs/") and path.endswith("/cancel"):
            parts = path.strip("/").split("/")
            job_id = parts[2] if len(parts) == 4 else ""
            if not self.server.jobs.get(job_id):
                self._error(HTTPStatus.NOT_FOUND, "Job not found.")
            elif self.server.jobs.cancel(job_id):
                self._json(HTTPStatus.OK, {"cancelled": True})
            else:
                self._error(HTTPStatus.CONFLICT, "Job is not running.")
            return
        try:
            payload = self._read_json()
            if path == "/v1/auth/start":
                job = self.server.jobs.start_auth(
                    str(payload.get("adapter") or ""),
                    str(payload.get("provider") or ""),
                )
                self._json(HTTPStatus.ACCEPTED, job.public())
                return
            if path in {"/v1/loop/claim", "/v1/loop/run", "/v1/loop/verify"}:
                if self.server.jobs.busy:
                    self._error(HTTPStatus.CONFLICT, "A loop job is already running.")
                    return
                if path.endswith("/claim"):
                    issue = payload.get("issue")
                    scope = str(payload.get("scope") or "")
                    harness = str(payload.get("harness") or "")
                    hours = payload.get("hours", 72)
                    job = self.server.jobs.start_loop(
                        "claim", lambda current: claim(current, issue, scope, harness, hours)
                    )
                elif path.endswith("/run"):
                    issue = payload.get("issue")
                    harness = str(payload.get("harness") or "")
                    task_markdown = str(payload.get("task_markdown") or "")
                    if not task_markdown:
                        raise ValueError("Task markdown is required.")
                    max_minutes = payload.get("max_minutes", self.server.loop_config["max_minutes"])
                    work_root = Path(self.server.loop_config["work_root"])
                    job = self.server.jobs.start_loop(
                        "run",
                        lambda current: run(
                            current, issue, harness, task_markdown, max_minutes, work_root=work_root
                        ),
                    )
                else:
                    pr_number = payload.get("pr")
                    harness = str(payload.get("harness") or "")
                    work_root = Path(self.server.loop_config["work_root"])
                    job = self.server.jobs.start_loop(
                        "verify",
                        lambda current: verify(current, pr_number, harness, work_root=work_root),
                    )
                self._json(HTTPStatus.ACCEPTED, job.public())
                return
            if path == "/v1/credentials":
                credential = self.server.vault.put_credential(
                    str(payload.get("provider") or ""),
                    str(payload.get("label") or ""),
                    str(payload.get("secret") or ""),
                )
                self._json(HTTPStatus.CREATED, credential)
                return
            if path == "/v1/chat/completions":
                self._proxy_openrouter(payload)
                return
        except (ValueError, VaultError) as error:
            self._error(HTTPStatus.BAD_REQUEST, str(error))
            return
        except AdapterError as error:
            message = sanitize_output(str(error))
            status = HTTPStatus.CONFLICT if message == "A loop job is already running." else HTTPStatus.BAD_GATEWAY
            self._error(status, message)
            return
        self._error(HTTPStatus.NOT_FOUND, "Route not found.")

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path
        if not self._guard():
            return
        if path.startswith("/v1/credentials/"):
            credential_id = path.rsplit("/", 1)[-1]
            if self.server.vault.delete_credential(credential_id):
                self._json(HTTPStatus.OK, {"deleted": True})
            else:
                self._error(HTTPStatus.NOT_FOUND, "Credential not found.")
            return
        self._error(HTTPStatus.NOT_FOUND, "Route not found.")


def serve(
    vault: EncryptedVault,
    origins: set[str],
    port: int,
    site_root: Path | None = None,
    loop_config: dict[str, Any] | None = None,
) -> None:
    server = CompanionServer(("127.0.0.1", port), vault, origins, site_root, loop_config)
    print(f"Synergy Local Companion listening on http://127.0.0.1:{port}")
    if site_root:
        print(f"Local reader: http://127.0.0.1:{port}/app/")
    print("Allowed origins:")
    for origin in sorted(origins):
        print(f"  {origin}")
    print(f"Pairing code: {vault.pairing_token}")
    print("Provider credentials stay in OMP, Hermes, official CLI stores, or the encrypted local vault.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
