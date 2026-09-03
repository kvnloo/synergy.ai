import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from synergy_companion.vault import EncryptedVault, VaultError


class EncryptedVaultTests(unittest.TestCase):
    def create_vault(self, path: Path) -> EncryptedVault:
        with patch("synergy_companion.vault._keyring_key", side_effect=VaultError("unavailable")):
            return EncryptedVault.open(path, passphrase="correct horse battery staple")

    def test_round_trip_keeps_pairing_and_provider_secret_out_of_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "vault.json"
            vault = self.create_vault(path)
            pairing_token = vault.pairing_token
            credential = vault.put_credential("openrouter", "Personal", "sk-secret-value")

            serialized = path.read_text("utf-8")
            self.assertNotIn(pairing_token, serialized)
            self.assertNotIn("sk-secret-value", serialized)
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)

            reopened = EncryptedVault.open(path, passphrase="correct horse battery staple")
            self.assertEqual(reopened.pairing_token, pairing_token)
            self.assertEqual(reopened.get_secret(credential["id"]), "sk-secret-value")
            self.assertNotIn("secret", reopened.list_credentials()[0])

    def test_authenticated_encryption_rejects_modified_ciphertext(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "vault.json"
            self.create_vault(path)
            envelope = json.loads(path.read_text("utf-8"))
            ciphertext = envelope["ciphertext"]
            envelope["ciphertext"] = ("A" if ciphertext[0] != "A" else "B") + ciphertext[1:]
            path.write_text(json.dumps(envelope), "utf-8")

            with self.assertRaisesRegex(VaultError, "authentication failed"):
                EncryptedVault.open(path, passphrase="correct horse battery staple")


if __name__ == "__main__":
    unittest.main()
