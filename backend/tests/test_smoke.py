import http.client
import json
import sys
import threading
import time
from pathlib import Path

from fastapi import FastAPI
import uvicorn

sys.path.append(str(Path(__file__).resolve().parents[1]))
from main import app  # noqa: E402


class SimpleResponse:
    def __init__(self, status_code: int, content: bytes):
        self.status_code = status_code
        self._content = content

    def json(self):
        return json.loads(self._content.decode())


try:
    from fastapi.testclient import TestClient  # type: ignore

    def get_client(api: FastAPI):
        return TestClient(api)

except RuntimeError:
    TestClient = None  # type: ignore

    class LiveServerClient:
        def __init__(self, api: FastAPI, host: str = "127.0.0.1", port: int = 8001) -> None:
            self.host = host
            self.port = port
            config = uvicorn.Config(api, host=host, port=port, log_level="warning")
            self.server = uvicorn.Server(config)
            self.thread = threading.Thread(target=self.server.run, daemon=True)

        def __enter__(self):
            self.thread.start()
            for _ in range(100):
                try:
                    conn = http.client.HTTPConnection(self.host, self.port, timeout=0.2)
                    conn.request("GET", "/health")
                    response = conn.getresponse()
                    response.read()
                    conn.close()
                    if response.status < 500:
                        break
                except Exception:
                    time.sleep(0.1)
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.server.should_exit = True
            self.thread.join(timeout=5)

        def get(self, path: str, headers=None):
            conn = http.client.HTTPConnection(self.host, self.port, timeout=2)
            conn.request("GET", path, headers=headers or {})
            response = conn.getresponse()
            content = response.read()
            conn.close()
            return SimpleResponse(response.status, content)

    def get_client(api: FastAPI):
        return LiveServerClient(api)


def test_health_ok():
    with get_client(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json().get("status") == "healthy"


def test_protected_requires_token():
    with get_client(app) as client:
        response = client.get("/favoritos")
        assert response.status_code == 401
