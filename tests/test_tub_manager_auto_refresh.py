from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
APP_TSX = REPO_ROOT / "web_ui" / "frontend" / "src" / "App.tsx"


def test_tub_manager_force_refreshes_when_entering_page():
    app_source = APP_TSX.read_text(encoding="utf-8")

    assert "loadTub" in app_source
    assert "getApiErrorMessage" in app_source
    assert "location.pathname === '/'" in app_source
    assert "Boolean(tubPath)" in app_source
    assert "loadTub(tubPath)" in app_source
    assert "setTub(" in app_source
    assert "prevLocationRef" not in app_source
