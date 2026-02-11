
import unittest
import os
import tarfile
import shutil
from pathlib import Path

class TestRestoreLogic(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path("test_restore_temp")
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)
        self.test_dir.mkdir()
        
        # Setup source data
        self.src_data = self.test_dir / "src_data"
        self.src_data.mkdir()
        (self.src_data / "file.txt").write_text("content")
        
        # Create archive WITH data prefix
        self.archive_with_prefix = self.test_dir / "with_prefix.tar.gz"
        with tarfile.open(self.archive_with_prefix, "w:gz") as tar:
            # Add as data/file.txt
            tar.add(self.src_data / "file.txt", arcname="data/file.txt")
            
        # Create archive WITHOUT data prefix
        self.archive_no_prefix = self.test_dir / "no_prefix.tar.gz"
        with tarfile.open(self.archive_no_prefix, "w:gz") as tar:
            # Add as file.txt
            tar.add(self.src_data / "file.txt", arcname="file.txt")

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_restore_with_prefix(self):
        # Simulate the logic in TUI
        selected = self.archive_with_prefix
        data_dir = self.test_dir / "restore_1" / "data"
        data_dir.mkdir(parents=True)
        
        # --- Logic from TUI ---
        with tarfile.open(selected, "r:gz") as tar:
            members = tar.getmembers()
            has_data_prefix = False
            if members:
                has_data_prefix = all(m.name == 'data' or m.name.startswith('data/') for m in members)
            
            extract_path = data_dir.parent if has_data_prefix else data_dir
            
            for member in members:
                if member.isdir():
                    target_dir = extract_path / member.name
                    target_dir.mkdir(parents=True, exist_ok=True)
                else:
                    tar.extract(member, extract_path)
        # ----------------------
        
        # Check result
        # Should be at restore_1/data/file.txt
        expected = data_dir / "file.txt"
        self.assertTrue(expected.exists(), f"File not found at {expected}")
        
        # Should NOT be at restore_1/data/data/file.txt
        not_expected = data_dir / "data" / "file.txt"
        self.assertFalse(not_expected.exists(), f"File incorrectly found at {not_expected}")

    def test_restore_no_prefix(self):
        # Simulate the logic in TUI
        selected = self.archive_no_prefix
        data_dir = self.test_dir / "restore_2" / "data"
        data_dir.mkdir(parents=True)
        
        # --- Logic from TUI ---
        with tarfile.open(selected, "r:gz") as tar:
            members = tar.getmembers()
            has_data_prefix = False
            if members:
                has_data_prefix = all(m.name == 'data' or m.name.startswith('data/') for m in members)
            
            extract_path = data_dir.parent if has_data_prefix else data_dir
            
            for member in members:
                if member.isdir():
                    target_dir = extract_path / member.name
                    target_dir.mkdir(parents=True, exist_ok=True)
                else:
                    tar.extract(member, extract_path)
        # ----------------------
        
        # Check result
        # Should be at restore_2/data/file.txt
        expected = data_dir / "file.txt"
        self.assertTrue(expected.exists(), f"File not found at {expected}")

if __name__ == '__main__':
    unittest.main()
