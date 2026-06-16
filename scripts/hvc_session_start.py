#!/usr/bin/env python3
"""HyperFocus Z0ne - Course Session Start Hook.

Writes a .focus_session_start marker, checks .env, docker-compose.yml,
and package.json.  Pings frontend dev server if running.
Exits 0 on pass, 1 on hard failure.
"""

import socket
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SESSION_FILE = ROOT / ".focus_session_start"


def _frontend_reachable() -> bool:
    try:
        s = socket.create_connection(("127.0.0.1", 5173), timeout=2)
        s.close()
        return True
    except OSError:
        return False


def main() -> int:
    now = datetime.now()
    print("\n[SESSION START] HyperFocus Z0ne -- Course")
    print("-" * 40)
    print("   Time    : " + now.strftime("%Y-%m-%d %H:%M:%S"))

    SESSION_FILE.write_text(now.isoformat())

    pkg_ok = (ROOT / "package.json").exists()
    env_ok = (ROOT / ".env").exists()
    compose_ok = (ROOT / "docker-compose.yml").exists()
    frontend_ok = _frontend_reachable()

    print("   package      : " + ("PASS found" if pkg_ok else "FAIL package.json missing"))
    print("   .env         : " + ("PASS found" if env_ok else "WARN missing (.env)"))
    print("   compose      : " + ("PASS found" if compose_ok else "WARN docker-compose.yml missing"))
    print("   frontend:5173: " + ("PASS reachable" if frontend_ok else "WARN offline (run npm run dev:frontend)"))
    print()

    if not pkg_ok:
        print("FAIL  Session start FAILED -- package.json not found.\n")
        return 1

    print("PASS  Course session started. BROski forever! Let's build!\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
