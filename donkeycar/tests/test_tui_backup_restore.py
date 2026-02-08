import tarfile
import tempfile
from pathlib import Path

from donkeycar.management.tui import _get_next_backup_path, _list_backup_archives, _archive_member_stats, _is_safe_member


def _write_file(path: Path, size: int):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"x" * size)


def test_get_next_backup_path_increments_sequence():
    with tempfile.TemporaryDirectory() as tmp:
        cache_dir = Path(tmp)
        date_str = "240101"
        (cache_dir / f"data-{date_str}-001.tar.gz").write_text("a")
        (cache_dir / f"data-{date_str}-003.tar.gz").write_text("b")
        next_path = _get_next_backup_path(cache_dir, date_str)
        assert next_path.name == f"data-{date_str}-004.tar.gz"


def test_list_backup_archives_filters_and_sorts():
    with tempfile.TemporaryDirectory() as tmp:
        cache_dir = Path(tmp)
        (cache_dir / "data-240101-001.tar.gz").write_text("a")
        (cache_dir / "data-240101-002.tar.gz").write_text("bb")
        (cache_dir / "data-240102-001.tar.gz").write_text("ccc")
        (cache_dir / "data-2401xx-001.tar.gz").write_text("bad")
        items = _list_backup_archives(cache_dir)
        names = [i["path"].name for i in items]
        assert names == ["data-240101-001.tar.gz", "data-240101-002.tar.gz", "data-240102-001.tar.gz"]
        assert items[0]["date"] == "240101"
        assert items[0]["size"] == 1


def test_archive_member_stats_counts_files():
    with tempfile.TemporaryDirectory() as tmp:
        data_dir = Path(tmp) / "data"
        _write_file(data_dir / "a.txt", 3)
        _write_file(data_dir / "sub" / "b.txt", 5)
        tar_path = Path(tmp) / "backup.tar.gz"
        with tarfile.open(tar_path, "w:gz") as tar:
            tar.add(data_dir / "a.txt", arcname="a.txt")
            tar.add(data_dir / "sub" / "b.txt", arcname="sub/b.txt")
        with tarfile.open(tar_path, "r:gz") as tar:
            files, size = _archive_member_stats(tar)
        assert files == 2
        assert size == 8


def test_is_safe_member_blocks_traversal():
    member = tarfile.TarInfo(name="../evil.txt")
    assert _is_safe_member(member) is False
