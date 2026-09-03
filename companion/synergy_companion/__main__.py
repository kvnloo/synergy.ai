from __future__ import annotations

import argparse
import getpass
import os
import sys
from pathlib import Path

from platformdirs import user_data_path

from .server import serve
from .vault import EncryptedVault, VaultError

DEFAULT_ORIGINS = {
    "https://kvnloo.github.io",
    "http://127.0.0.1:4387",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
}


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        prog="synergy-companion",
        description="Local encrypted provider bridge for Synergy. Binds to loopback only.",
    )
    result.add_argument("--port", type=int, default=4388)
    result.add_argument(
        "--origin",
        action="append",
        default=[],
        help="Additional exact browser origin to allow. Repeat for multiple origins.",
    )
    result.add_argument(
        "--vault",
        type=Path,
        default=user_data_path("synergy-companion", "Synergy") / "vault.json",
    )
    result.add_argument("--rotate-pairing", action="store_true")
    result.add_argument("--show-pairing", action="store_true")
    return result


def open_vault(path: Path) -> EncryptedVault:
    passphrase = os.environ.get("SYNERGY_VAULT_PASSPHRASE")
    try:
        return EncryptedVault.open(path, passphrase=passphrase)
    except VaultError as error:
        can_prompt = "No usable OS keychain" in str(error) or "requires a passphrase" in str(error)
        if passphrase or not sys.stdin.isatty() or not can_prompt:
            raise
        entered = getpass.getpass("Enter the local vault passphrase: ")
        return EncryptedVault.open(path, passphrase=entered)


def main() -> None:
    args = parser().parse_args()
    if not 1024 <= args.port <= 65535:
        raise SystemExit("Port must be between 1024 and 65535.")
    origins = DEFAULT_ORIGINS | {origin.rstrip("/") for origin in args.origin if origin}
    try:
        vault = open_vault(args.vault)
    except VaultError as error:
        raise SystemExit(f"Vault error: {error}") from error

    if args.rotate_pairing:
        token = vault.rotate_pairing_token()
        print(f"New pairing code: {token}")
        if args.show_pairing:
            return
    elif args.show_pairing:
        print(vault.pairing_token)
        return

    serve(vault, origins, args.port)


if __name__ == "__main__":
    main()
