from pathlib import Path


_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "donkeycar" / "templates"


def test_complete_template_uses_drive_api_bridge_when_server_url_is_set():
    source = (_TEMPLATES_DIR / "complete.py").read_text(encoding="utf-8")

    assert "from donkeydrifter.parts.drive_api_bridge import DriveApiBridge" in source
    assert "DRIVE_API_SERVER_URL" in source
    assert "DriveApiBridge(server_url=server_url)" in source
    assert "LocalWebController(port=cfg.WEB_CONTROL_PORT" in source


def test_basic_template_uses_drive_api_bridge_when_server_url_is_set():
    source = (_TEMPLATES_DIR / "basic.py").read_text(encoding="utf-8")

    assert "from donkeydrifter.parts.drive_api_bridge import DriveApiBridge" in source
    assert "DRIVE_API_SERVER_URL" in source
    assert "DriveApiBridge(server_url=server_url)" in source
    assert "LocalWebController(port=cfg.WEB_CONTROL_PORT" in source
    assert "'web/buttons'" in source
