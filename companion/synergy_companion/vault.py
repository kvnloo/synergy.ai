from __future__ import annotations

import base64
import json
import os
import secrets
import stat
import threading
import time
import uuid
from pathlib import Path
from typing import Any

import keyring
from argon2.low_level import Type, hash_secret_raw
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

VAULT_VERSION = 1
VAULT_AAD = b"synergy-local-vault-v1"
KEYRING_SERVICE = "ai.synergy.local-companion"
KEYRING_USER = "vault-master-key-v1"


class VaultError(RuntimeError):
    pass


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _derive_passphrase_key(passphrase: str, salt: bytes) -> bytes:
    if len(passphrase) < 12:
        raise VaultError("The vault passphrase must contain at least 12 characters.")
    return hash_secret_raw(
        secret=passphrase.encode("utf-8"),
        salt=salt,
        time_cost=3,
        memory_cost=64 * 1024,
        parallelism=2,
        hash_len=32,
        type=Type.ID,
    )


def _read_envelope(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        envelope = json.loads(path.read_text("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise VaultError(f"Cannot read encrypted vault: {error}") from error
    if envelope.get("version") != VAULT_VERSION:
        raise VaultError("Unsupported encrypted vault version.")
    return envelope


def _keyring_key(create: bool) -> bytes:
    try:
        encoded = keyring.get_password(KEYRING_SERVICE, KEYRING_USER)
        if encoded:
            key = _decode(encoded)
            if len(key) != 32:
                raise VaultError("The keychain contains an invalid Synergy vault key.")
            return key
        if not create:
            raise VaultError("The Synergy vault key is missing from the OS keychain.")
        key = secrets.token_bytes(32)
        keyring.set_password(KEYRING_SERVICE, KEYRING_USER, _encode(key))
        return key
    except VaultError:
        raise
    except Exception as error:
        raise VaultError(f"OS keychain is unavailable: {error}") from error


class EncryptedVault:
    """Authenticated local storage. Provider secrets are never returned by list APIs."""

    def __init__(self, path: Path, key: bytes, key_source: str, salt: bytes | None = None):
        self.path = path
        self._key = key
        self._key_source = key_source
        self._salt = salt
        self._lock = threading.RLock()
        self._data: dict[str, Any] = {}

    @classmethod
    def open(cls, path: Path, passphrase: str | None = None) -> "EncryptedVault":
        path = path.expanduser().resolve()
        envelope = _read_envelope(path)
        salt: bytes | None = None

        if envelope:
            key_source = str(envelope.get("key_source") or "")
            if key_source == "keyring":
                key = _keyring_key(create=False)
            elif key_source == "passphrase":
                if not passphrase:
                    raise VaultError("This vault requires a passphrase.")
                salt = _decode(str(envelope.get("salt") or ""))
                if len(salt) != 16:
                    raise VaultError("The vault contains an invalid Argon2id salt.")
                key = _derive_passphrase_key(passphrase, salt)
            else:
                raise VaultError("The vault has an unknown key source.")
        else:
            if passphrase:
                salt = secrets.token_bytes(16)
                key = _derive_passphrase_key(passphrase, salt)
                key_source = "passphrase"
            else:
                try:
                    key = _keyring_key(create=True)
                    key_source = "keyring"
                except VaultError:
                    raise VaultError(
                        "No usable OS keychain was found. Set SYNERGY_VAULT_PASSPHRASE "
                        "or start the companion in a terminal and enter a passphrase."
                    )

        vault = cls(path, key, key_source, salt)
        if envelope:
            vault._data = vault._decrypt(envelope)
        else:
            vault._data = {
                "pairing_token": _encode(secrets.token_bytes(32)),
                "credentials": [],
                "created_at": int(time.time()),
            }
            vault.save()
        return vault

    @property
    def pairing_token(self) -> str:
        return str(self._data["pairing_token"])

    def rotate_pairing_token(self) -> str:
        with self._lock:
            self._data["pairing_token"] = _encode(secrets.token_bytes(32))
            self.save()
            return self.pairing_token

    def list_credentials(self) -> list[dict[str, Any]]:
        with self._lock:
            return [
                {key: value for key, value in entry.items() if key != "secret"}
                for entry in self._data.get("credentials", [])
            ]

    def put_credential(self, provider: str, label: str, secret: str) -> dict[str, Any]:
        provider = provider.strip().lower()
        label = label.strip()
        if not provider or not label or not secret:
            raise VaultError("Provider, label, and secret are required.")
        with self._lock:
            entry = {
                "id": uuid.uuid4().hex,
                "provider": provider,
                "label": label,
                "secret": secret,
                "created_at": int(time.time()),
            }
            self._data.setdefault("credentials", []).append(entry)
            self.save()
            return {key: value for key, value in entry.items() if key != "secret"}

    def get_secret(self, credential_id: str) -> str:
        with self._lock:
            for entry in self._data.get("credentials", []):
                if entry.get("id") == credential_id:
                    return str(entry["secret"])
        raise VaultError("Credential not found.")

    def delete_credential(self, credential_id: str) -> bool:
        with self._lock:
            credentials = self._data.get("credentials", [])
            remaining = [entry for entry in credentials if entry.get("id") != credential_id]
            if len(remaining) == len(credentials):
                return False
            self._data["credentials"] = remaining
            self.save()
            return True

    def save(self) -> None:
        with self._lock:
            nonce = secrets.token_bytes(12)
            plaintext = json.dumps(self._data, separators=(",", ":"), sort_keys=True).encode("utf-8")
            ciphertext = AESGCM(self._key).encrypt(nonce, plaintext, VAULT_AAD)
            envelope: dict[str, Any] = {
                "version": VAULT_VERSION,
                "cipher": "AES-256-GCM",
                "key_source": self._key_source,
                "nonce": _encode(nonce),
                "ciphertext": _encode(ciphertext),
            }
            if self._salt is not None:
                envelope["kdf"] = "Argon2id"
                envelope["salt"] = _encode(self._salt)
            self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            try:
                os.chmod(self.path.parent, stat.S_IRWXU)
            except OSError:
                pass
            temporary = self.path.with_suffix(self.path.suffix + ".tmp")
            with temporary.open("w", encoding="utf-8") as handle:
                json.dump(envelope, handle, separators=(",", ":"), sort_keys=True)
                handle.flush()
                os.fsync(handle.fileno())
            os.chmod(temporary, stat.S_IRUSR | stat.S_IWUSR)
            os.replace(temporary, self.path)

    def _decrypt(self, envelope: dict[str, Any]) -> dict[str, Any]:
        try:
            plaintext = AESGCM(self._key).decrypt(
                _decode(str(envelope["nonce"])),
                _decode(str(envelope["ciphertext"])),
                VAULT_AAD,
            )
            data = json.loads(plaintext)
        except (KeyError, ValueError, InvalidTag, UnicodeDecodeError, json.JSONDecodeError) as error:
            raise VaultError("Vault authentication failed. The passphrase is wrong or the file was modified.") from error
        if not isinstance(data, dict) or not isinstance(data.get("pairing_token"), str):
            raise VaultError("The decrypted vault has an invalid structure.")
        return data
