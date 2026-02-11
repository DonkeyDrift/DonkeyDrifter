import os
import shutil
import tempfile
import unittest
from pathlib import Path
from donkeycar.management.data_migrator import DataMigrator, DataMigrationError

class TestDataMigrator(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.original_cwd = os.getcwd()
        os.chdir(self.test_dir)
        self.data_dir = Path("data")
        self.data_dir.mkdir()
        self.migrator = DataMigrator()

    def tearDown(self):
        os.chdir(self.original_cwd)
        shutil.rmtree(self.test_dir)

    def create_file(self, path: Path, content="test"):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            f.write(content)

    def test_flatten_simple_nested_data(self):
        # Setup: data/data/file.txt
        nested_data = self.data_dir / "data"
        file_path = nested_data / "file.txt"
        self.create_file(file_path, "content")
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertEqual(report["moved_files"], 1)
        self.assertTrue((self.data_dir / "file.txt").exists())
        self.assertFalse(nested_data.exists())
        self.assertEqual(report["errors"], [])

    def test_flatten_nested_with_subdir(self):
        # Setup: data/data/tub_1/file.txt
        nested_data = self.data_dir / "data"
        file_path = nested_data / "tub_1" / "file.txt"
        self.create_file(file_path, "content")
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertEqual(report["moved_files"], 1) # Moving tub_1 counts as 1 move if we move directories?
        # My implementation moves items in data/data.
        # tub_1 is an item. It gets moved.
        
        self.assertTrue((self.data_dir / "tub_1" / "file.txt").exists())
        self.assertFalse(nested_data.exists())

    def test_conflict_resolution_files(self):
        # Setup: 
        # data/file.txt
        # data/data/file.txt (different content)
        file1 = self.data_dir / "file.txt"
        self.create_file(file1, "original")
        
        nested_data = self.data_dir / "data"
        file2 = nested_data / "file.txt"
        self.create_file(file2, "new")
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertEqual(report["moved_files"], 1)
        self.assertTrue(file1.exists())
        self.assertEqual(file1.read_text(), "original")
        
        # Check for renamed file
        files = list(self.data_dir.glob("file_*.txt"))
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0].read_text(), "new")
        self.assertFalse(nested_data.exists())

    def test_conflict_resolution_dirs(self):
        # Setup:
        # data/tub1/
        # data/data/tub1/
        tub1 = self.data_dir / "tub1"
        tub1.mkdir()
        (tub1 / "f1").touch()
        
        nested_tub1 = self.data_dir / "data" / "tub1"
        nested_tub1.mkdir(parents=True)
        (nested_tub1 / "f2").touch()
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertEqual(report["moved_files"], 1)
        self.assertTrue(tub1.exists())
        self.assertTrue((tub1 / "f1").exists())
        
        # Should be renamed
        renamed_dirs = [d for d in self.data_dir.iterdir() if d.is_dir() and d.name.startswith("tub1_")]
        self.assertEqual(len(renamed_dirs), 1)
        self.assertTrue((renamed_dirs[0] / "f2").exists())

    def test_deep_nesting(self):
        # Setup: data/data/data/file.txt
        deep_file = self.data_dir / "data" / "data" / "file.txt"
        self.create_file(deep_file)
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertTrue((self.data_dir / "file.txt").exists())
        self.assertFalse((self.data_dir / "data").exists())

    def test_multiple_nested_data(self):
        # Setup:
        # data/A/data/f1.txt
        # data/B/data/f2.txt
        f1 = self.data_dir / "A" / "data" / "f1.txt"
        f2 = self.data_dir / "B" / "data" / "f2.txt"
        self.create_file(f1)
        self.create_file(f2)
        
        report = self.migrator.flatten_nested_data(self.data_dir)
        
        self.assertTrue((self.data_dir / "A" / "f1.txt").exists())
        self.assertFalse((self.data_dir / "A" / "data").exists())
        
        self.assertTrue((self.data_dir / "B" / "f2.txt").exists())
        self.assertFalse((self.data_dir / "B" / "data").exists())

    def test_rollback(self):
        # Mocking failure
        # We need to inject a failure.
        # Let's subclass DataMigrator and override _move_contents to fail on second file
        class FailingMigrator(DataMigrator):
            def _move_contents(self, src, dst):
                # We call super for first item, raise for second
                # This is hard to control deterministically without mocking iterdir.
                # Let's just mock shutil.move
                pass
        
        # Instead of complex mocking, let's manually test rollback method
        # Setup: Move A -> B
        src = self.data_dir / "src.txt"
        dst = self.data_dir / "dst.txt"
        self.create_file(src, "content")
        
        self.migrator.operations.append(("move", str(src), str(dst)))
        # Perform the move manually so we can rollback it
        shutil.move(str(src), str(dst))
        
        self.migrator.rollback()
        
        self.assertTrue(src.exists())
        self.assertFalse(dst.exists())

if __name__ == '__main__':
    unittest.main()
