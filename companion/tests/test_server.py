import http.client
import json
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

from synergy_companion.server import CompanionServer
from synergy_companion.adapters import Job
from synergy_companion.vault import EncryptedVault, VaultError


class CompanionServerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        path = Path(self.temporary.name) / "vault.json"
        with patch("synergy_companion.vault._keyring_key", side_effect=VaultError("unavailable")):
            self.vault = EncryptedVault.open(path, passphrase="correct horse battery staple")
        self.origin = "https://kvnloo.github.io"
        self.server = CompanionServer(
            ("127.0.0.1", 0),
            self.vault,
            {self.origin},
            Path(__file__).resolve().parents[2],
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temporary.cleanup()

    def request(self, method, path, *, origin=None, token=None, payload=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        headers = {"Origin": origin or self.origin}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        body = None
        if payload is not None:
            body = json.dumps(payload)
            headers["Content-Type"] = "application/json"
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        parsed = json.loads(response.read()) if response.length != 0 else None
        connection.close()
        return response.status, dict(response.getheaders()), parsed

    def test_rejects_unlisted_origin_and_missing_pairing_token(self):
        status, _, _ = self.request("GET", "/v1/health", origin="https://attacker.example")
        self.assertEqual(status, 403)
        status, _, _ = self.request("GET", "/v1/credentials")
        self.assertEqual(status, 401)

    def test_paired_origin_can_store_and_list_only_credential_metadata(self):
        token = self.vault.pairing_token
        status, headers, created = self.request(
            "POST",
            "/v1/credentials",
            token=token,
            payload={"provider": "openrouter", "label": "Personal", "secret": "sk-private"},
        )
        self.assertEqual(status, 201)
        self.assertEqual(headers["Access-Control-Allow-Origin"], self.origin)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertNotIn("secret", created)

        status, _, credentials = self.request("GET", "/v1/credentials", token=token)
        self.assertEqual(status, 200)
        self.assertEqual(credentials[0]["label"], "Personal")
        self.assertNotIn("secret", credentials[0])

    def test_local_chat_uses_secret_only_for_provider_request(self):
        credential = self.vault.put_credential("openrouter", "Personal", "sk-provider-secret")
        captured = {}

        class ProviderResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_):
                return False

            def read(self, _limit):
                return json.dumps({"choices": [{"message": {"content": "Grounded answer [1]."}}]}).encode()

        def provider_request(request, timeout):
            captured["authorization"] = request.get_header("Authorization")
            captured["timeout"] = timeout
            return ProviderResponse()

        with patch("synergy_companion.server.urlopen", side_effect=provider_request):
            status, _, payload = self.request(
                "POST",
                "/v1/chat/completions",
                token=self.vault.pairing_token,
                payload={
                    "credential_id": credential["id"],
                    "model": "openrouter/free",
                    "messages": [{"role": "user", "content": "Question"}],
                },
            )

        self.assertEqual(status, 200)
        self.assertEqual(captured["authorization"], "Bearer sk-provider-secret")
        self.assertEqual(captured["timeout"], 90)
        self.assertNotIn("sk-provider-secret", json.dumps(payload))

    def test_jobs_busy_returns_409(self):
        busy_job = Job("busy", kind="run", status="running")
        self.server.jobs._jobs[busy_job.id] = busy_job
        status, _, payload = self.request(
            "POST",
            "/v1/loop/claim",
            token=self.vault.pairing_token,
            payload={"issue": 1, "scope": "A bounded task", "harness": "manual", "hours": 72},
        )
        self.assertEqual(status, 409)
        self.assertEqual(payload, {"error": "A loop job is already running."})


    def test_local_reader_is_served_without_cross_origin_fetch(self):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()

        self.assertEqual(response.status, 200)
        self.assertIn("text/html", response.getheader("Content-Type"))
        self.assertIn("Synergy Local Companion", body)
        self.assertIn('src="app.js"', body)

        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request(
            "GET",
            "/v1/credentials",
            headers={
                "Authorization": f"Bearer {self.vault.pairing_token}",
                "Sec-Fetch-Site": "same-origin",
            },
        )
        response = connection.getresponse()
        payload = json.loads(response.read())
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertEqual(payload, [])
    def test_app_serves_companion_bot_js(self):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/companion-bot.js")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertIn("javascript", response.getheader("Content-Type"))
        self.assertTrue(body)
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/recall.js")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertIn("javascript", response.getheader("Content-Type"))
        self.assertIn("buildPrompts", body)
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/trust.js")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertIn("javascript", response.getheader("Content-Type"))
        self.assertIn("buildCorrectionUrl", body)
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/sw.js")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertIn("synergy-", body)
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        connection.request("GET", "/app/manifest.webmanifest")
        response = connection.getresponse()
        body = response.read().decode()
        connection.close()
        self.assertEqual(response.status, 200)
        self.assertIn("Synergy", body)


if __name__ == "__main__":
    unittest.main()
