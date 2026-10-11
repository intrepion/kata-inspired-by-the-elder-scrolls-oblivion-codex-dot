#!/usr/bin/env python3
"""Session-only detached preview. Does not change boot/login configuration."""
import pathlib, socket, subprocess, shutil, sys
root = pathlib.Path(__file__).resolve().parent.parent
port = int(sys.argv[1]) if len(sys.argv) > 1 else 5199
with socket.socket() as probe:
    try:
        probe.bind(("127.0.0.1", port))
    except OSError:
        sys.exit(f"Port {port} is already occupied. No existing server was touched.")
log = open(root / "preview.log", "a")
process = subprocess.Popen(
    [shutil.which("node"), str(root / "node_modules/vite/bin/vite.js"),
     "preview", "--host", "127.0.0.1", "--port", str(port), "--strictPort"],
    cwd=root, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True,
)
(root / ".server.pid").write_text(str(process.pid))
print(f"Preview launched independently: PID {process.pid}, http://127.0.0.1:{port}")
