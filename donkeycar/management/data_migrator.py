import os
import shutil
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

class DataMigrationError(Exception):
    pass

class DataMigrator:
    def __init__(self):
        self.operations: List[Tuple[str, str, Optional[str]]] = []  # (action, src, dest)
        self.logger = logging.getLogger("DataMigrator")
        self.moved_files_count = 0
        self.errors: List[str] = []

    def flatten_nested_data(self, root_data_dir: Path) -> Dict[str, Any]:
        """
        Scans root_data_dir for nested 'data' folders and moves their content to their parent.
        Returns a report dictionary.
        
        Args:
            root_data_dir: The root 'data' directory (e.g., ./data)
        """
        self.operations = []
        self.moved_files_count = 0
        self.errors = []
        
        max_iterations = 10
        iteration = 0
        
        try:
            while iteration < max_iterations:
                nested_dirs = self._find_nested_data_dirs(root_data_dir)
                if not nested_dirs:
                    break
                    
                # Process bottom-up (longest paths first) to handle multi-level nesting safely
                nested_dirs.sort(key=lambda p: len(p.parts), reverse=True)
                
                processed_in_this_pass = 0
                for target_dir in nested_dirs:
                    if not target_dir.exists():
                        continue
                    
                    parent_dir = target_dir.parent
                    # Move contents
                    self._move_contents(target_dir, parent_dir)
                    
                    # Remove the now empty 'data' folder
                    try:
                        # Only remove if empty
                        if not any(target_dir.iterdir()):
                            target_dir.rmdir()
                            self.operations.append(("rmdir", str(target_dir), None))
                            processed_in_this_pass += 1
                        else:
                            # If not empty, we shouldn't delete it, but we also didn't move everything?
                            # _move_contents moves everything. If something remains, it's an error or skipped.
                            self.errors.append(f"Directory not empty after migration: {target_dir}")
                    except Exception as e:
                        self.errors.append(f"Failed to remove directory {target_dir}: {e}")
                        raise DataMigrationError(f"Failed to remove directory {target_dir}: {e}")
                
                if processed_in_this_pass == 0:
                    break
                
                iteration += 1
                
        except Exception as e:
            self.errors.append(str(e))
            self.rollback()
            raise e

        return {
            "moved_files": self.moved_files_count,
            "errors": self.errors,
            "operations_count": len(self.operations),
            "success": len(self.errors) == 0
        }

    def _find_nested_data_dirs(self, root: Path) -> List[Path]:
        nested = []
        for dirpath, dirnames, filenames in os.walk(root):
            if "data" in dirnames:
                target = Path(dirpath) / "data"
                # Ensure we don't include the root itself if root is named 'data'
                # But os.walk(root) iterates inside root.
                # If root is '.../data', dirnames contains subdirs.
                # If a subdir is named 'data', it is a nested data.
                nested.append(target)
        return nested

    def _move_contents(self, src_dir: Path, dst_dir: Path):
        for item in src_dir.iterdir():
            src_path = item
            dst_path = dst_dir / item.name
            
            # Conflict resolution
            if dst_path.exists():
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                # Handle filename extension correctly
                stem = item.stem
                # For directories, stem is just the name. suffix is empty.
                # For files like archive.tar.gz, suffix is .gz, stem is archive.tar
                # pathlib suffix only gives last extension.
                
                suffixes = "".join(item.suffixes)
                # If it's a directory, suffixes is empty string usually (unless dir name has dots)
                
                # Simple approach: name_timestamp.ext
                if item.is_dir():
                    new_name = f"{item.name}_{timestamp}"
                else:
                    # For files
                    # item.name = foo.txt -> stem=foo, suffix=.txt
                    # item.name = foo.tar.gz -> stem=foo.tar, suffix=.gz
                    # We want foo_timestamp.tar.gz
                    # But stem logic in pathlib is simple.
                    # Let's just insert timestamp before the first dot? Or before the last?
                    # Usually append to stem.
                    # safe approach:
                    base_name = item.name
                    if '.' in base_name:
                        parts = base_name.split('.')
                        parts[0] = f"{parts[0]}_{timestamp}"
                        new_name = ".".join(parts)
                    else:
                        new_name = f"{base_name}_{timestamp}"
                
                dst_path = dst_dir / new_name
            
            try:
                shutil.move(str(src_path), str(dst_path))
                self.operations.append(("move", str(src_path), str(dst_path)))
                self.moved_files_count += 1
            except Exception as e:
                raise DataMigrationError(f"Failed to move {src_path} to {dst_path}: {e}")

    def rollback(self):
        """Reverts all operations in reverse order."""
        for op_type, src, dest in reversed(self.operations):
            try:
                if op_type == "rmdir":
                    # Recreate directory
                    Path(src).mkdir(parents=True, exist_ok=True)
                elif op_type == "move":
                    # Move back from dest to src
                    src_path = Path(src)
                    dest_path = Path(dest)
                    
                    if dest_path.exists():
                        # Ensure parent exists
                        src_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(dest_path), str(src_path))
                    else:
                        self.errors.append(f"Rollback warning: {dest} not found")
            except Exception as e:
                self.errors.append(f"Rollback failed for {op_type} {src}: {e}")
