from pathlib import Path

from donkeycar.management.tui import WebUICommand


def test_web_command_uses_bundled_web_ui_path():
    cmd = WebUICommand().get_command_line({})

    assert cmd[:2] == ["donkey", "web"]
    assert "--path" in cmd
    assert cmd != ["donkey", "web"]

    web_ui_path = Path(cmd[cmd.index("--path") + 1])
    assert web_ui_path.is_dir()
    assert (web_ui_path / "frontend").is_dir()
    assert (web_ui_path / "backend").is_dir()
