from pathlib import Path

from donkeycar.management import tui


class FakeProcess:
    returncode = 0
    pid = 12345

    def poll(self):
        return 0

    def wait(self, timeout=None):
        return 0


class ProcessingStreamWithoutFileno:
    def write(self, value):
        return len(value)

    def flush(self):
        pass


def test_drive_command_inherits_stdio_without_requiring_fileno(monkeypatch, tmp_path):
    popen_kwargs = {}
    prompts = iter(["0", "y", ""])

    (tmp_path / "manage.py").write_text("", encoding="utf-8")
    (tmp_path / "myconfig.py").write_text("", encoding="utf-8")
    (tmp_path / "models").mkdir()
    monkeypatch.chdir(tmp_path)

    monkeypatch.setattr(tui.console, "clear", lambda: None)
    monkeypatch.setattr(tui.console, "print", lambda *args, **kwargs: None)
    monkeypatch.setattr(tui.Prompt, "ask", lambda *args, **kwargs: next(prompts))
    monkeypatch.setattr(tui.sys, "stdout", ProcessingStreamWithoutFileno())
    monkeypatch.setattr(tui.sys, "stderr", ProcessingStreamWithoutFileno())

    def fake_popen(cmd_list, **kwargs):
        popen_kwargs.update(kwargs)
        return FakeProcess()

    monkeypatch.setattr(tui.subprocess, "Popen", fake_popen)

    tui.DriveCommand().execute()

    assert popen_kwargs.get("stdout") is None
    assert popen_kwargs.get("stderr") is None
