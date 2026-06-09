from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
APP_TSX = REPO_ROOT / "web_ui" / "frontend" / "src" / "App.tsx"


def test_tub_manager_refreshes_after_returning_from_drive():
    app_source = APP_TSX.read_text(encoding="utf-8")

    assert "loadTub" in app_source
    assert "getApiErrorMessage" in app_source
    assert "prevLocationRef" in app_source
    assert "prevLocationRef.current === '/drive'" in app_source
    assert "location.pathname === '/'" in app_source
    assert "loadTub(tubPath)" in app_source
    assert "setTub(" in app_source
