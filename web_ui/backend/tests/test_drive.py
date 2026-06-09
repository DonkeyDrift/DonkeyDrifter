import importlib
import sys
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def make_client():
    drive = importlib.import_module("routers.drive")
    drive = importlib.reload(drive)
    app = FastAPI()
    app.include_router(drive.router, prefix="/api/drive")
    return TestClient(app), drive


def test_drive_stats_reports_recent_fps():
    client, drive = make_client()
    drive.drive_state.car_last_seen = datetime.now()
    drive.drive_state.frame_timestamps.extend([1.0, 1.25, 1.5, 1.75, 2.0])

    response = client.get("/api/drive/stats")

    assert response.status_code == 200
    assert response.json() == {"online": True, "fps": 4}
