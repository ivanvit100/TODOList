#!/usr/bin/env python3
import os
import subprocess
import sys
import signal

APP_DIR = os.path.dirname(os.path.abspath(__file__))
SOCKET_PATH = os.path.join(APP_DIR, "todoapp.sock")
BIND = f"unix:{SOCKET_PATH}"
WORKERS = 4
TIMEOUT = 120

if os.path.exists(SOCKET_PATH):
    os.remove(SOCKET_PATH)

cmd = [
    "gunicorn",
    "--bind", BIND,
    "--workers", str(WORKERS),
    "--timeout", str(TIMEOUT),
    "main:app"
]

def signal_handler(sig, frame):
    if os.path.exists(SOCKET_PATH):
        os.remove(SOCKET_PATH)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

try:
    process = subprocess.Popen(cmd)
    process.wait()
finally:
    if os.path.exists(SOCKET_PATH):
        os.remove(SOCKET_PATH)