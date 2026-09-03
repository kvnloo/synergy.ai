import unittest
from unittest.mock import patch

from synergy_companion.adapters import HermesAdapter, OmpAdapter, sanitize_output


class AdapterTests(unittest.TestCase):
    def test_omp_login_uses_auth_broker_without_exposing_tokens(self):
        adapter = OmpAdapter()
        with patch.object(adapter, "providers", return_value=[{"id": "anthropic", "label": "Anthropic"}]):
            self.assertEqual(
                adapter.auth_command("anthropic"),
                ["omp", "auth-broker", "login", "anthropic"],
            )

    def test_hermes_login_is_provider_scoped_oauth(self):
        adapter = HermesAdapter()
        self.assertEqual(
            adapter.auth_command("openai-codex"),
            [
                "hermes",
                "auth",
                "add",
                "openai-codex",
                "--type",
                "oauth",
                "--label",
                "synergy-openai-codex",
            ],
        )

    def test_output_redacts_api_keys_tokens_and_jwts(self):
        value = "sk-abcdefghijklmnop access_token=top-secret eyJheaderpayload1234567890.bodybodybody.signaturepart"
        sanitized = sanitize_output(value)
        self.assertNotIn("sk-abcdefghijklmnop", sanitized)
        self.assertNotIn("top-secret", sanitized)
        self.assertNotIn("eyJheader", sanitized)


if __name__ == "__main__":
    unittest.main()
