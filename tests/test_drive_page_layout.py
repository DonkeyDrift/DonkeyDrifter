from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
APP_TSX = REPO_ROOT / "web_ui" / "frontend" / "src" / "App.tsx"


def test_drive_page_does_not_mount_config_loaders():
    app_source = APP_TSX.read_text(encoding="utf-8")
    sidepanel_source = (APP_TSX.parent / "components" / "SidePanel.tsx").read_text(encoding="utf-8")

    # App.tsx mounts SidePanel unconditionally; visibility is managed internally
    assert "<SidePanel />" in app_source
    assert "shouldShowLoaders" not in app_source
    assert "pathname !== '/drive'" not in app_source

    # SidePanel uses activeDrawer state to control loader visibility
    assert "activeDrawer" in sidepanel_source
    assert "setActiveDrawer" in sidepanel_source
