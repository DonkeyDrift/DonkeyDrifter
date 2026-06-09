import subprocess
import sys
from configparser import ConfigParser
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def run_python_snippet(snippet):
    return subprocess.run(
        [sys.executable, "-c", snippet],
        cwd=PROJECT_ROOT,
        capture_output=True,
        check=False,
        text=True,
    )


def test_import_donkeycar_does_not_write_stdout():
    result = run_python_snippet("import donkeycar")

    assert result.returncode == 0
    assert result.stdout == ""


def test_version_is_available_from_side_effect_free_module():
    result = run_python_snippet(
        "from donkeycar._version import __version__; print(__version__)"
    )

    assert result.returncode == 0
    assert result.stdout.strip()


def test_package_version_matches_side_effect_free_version_module():
    result = run_python_snippet(
        "import donkeycar; from donkeycar._version import __version__; "
        "print(donkeycar.__version__ == __version__)"
    )

    assert result.returncode == 0
    assert result.stdout.strip() == "True"


def test_setup_cfg_reads_version_from_side_effect_free_module():
    parser = ConfigParser()
    parser.read(PROJECT_ROOT / "setup.cfg", encoding="utf-8")

    assert parser["metadata"]["version"] == "attr: donkeycar._version.__version__"


def test_import_donkeydrifter_does_not_write_stdout():
    result = run_python_snippet("import donkeydrifter")

    assert result.returncode == 0
    assert result.stdout == ""


def test_donkeydrifter_exports_vehicle():
    result = run_python_snippet("from donkeydrifter import Vehicle; print(Vehicle)")

    assert result.returncode == 0
    assert "Vehicle" in result.stdout


def test_donkeydrifter_version_matches_donkeycar():
    result = run_python_snippet(
        "import donkeycar, donkeydrifter; "
        "print(donkeydrifter.__version__ == donkeycar.__version__)"
    )

    assert result.returncode == 0
    assert result.stdout.strip() == "True"


def test_donkeydrifter_vehicle_alias_matches_legacy_module():
    result = run_python_snippet(
        "from donkeydrifter.vehicle import Vehicle; "
        "from donkeycar.vehicle import Vehicle as LegacyVehicle; "
        "print(Vehicle is LegacyVehicle)"
    )

    assert result.returncode == 0
    assert result.stdout.strip() == "True"


def test_donkeydrifter_parts_alias_matches_legacy_module():
    result = run_python_snippet(
        "from donkeydrifter.parts.tub_v2 import TubWriter; "
        "from donkeycar.parts.tub_v2 import TubWriter as LegacyTubWriter; "
        "print(TubWriter is LegacyTubWriter)"
    )

    assert result.returncode == 0
    assert result.stdout.strip() == "True"


def test_donkeydrifter_management_alias_is_available():
    result = run_python_snippet(
        "from donkeydrifter.management.base import execute_from_command_line; "
        "print(callable(execute_from_command_line))"
    )

    assert result.returncode == 0
    assert result.stdout.strip() == "True"
