import importlib
import importlib.abc
import importlib.util
import sys

from donkeycar import *  # noqa: F401,F403
from donkeycar._version import __version__

_SUBMODULES = (
    "config",
    "contrib",
    "geom",
    "la",
    "memory",
    "vehicle",
    "management",
    "parts",
    "pipeline",
    "templates",
    "utils",
)


class _DonkeyDrifterAliasFinder(importlib.abc.MetaPathFinder,
                                importlib.abc.Loader):
    def find_spec(self, fullname, path=None, target=None):
        if not fullname.startswith("donkeydrifter."):
            return None

        legacy_name = "donkeycar" + fullname[len("donkeydrifter"):]
        legacy_spec = importlib.util.find_spec(legacy_name)
        if legacy_spec is None:
            return None

        is_package = legacy_spec.submodule_search_locations is not None
        return importlib.util.spec_from_loader(
            fullname, self, is_package=is_package
        )

    def create_module(self, spec):
        legacy_name = "donkeycar" + spec.name[len("donkeydrifter"):]
        module = importlib.import_module(legacy_name)
        sys.modules[spec.name] = module
        return module

    def exec_module(self, module):
        return None


if not any(isinstance(finder, _DonkeyDrifterAliasFinder)
           for finder in sys.meta_path):
    sys.meta_path.insert(0, _DonkeyDrifterAliasFinder())

for module_name in _SUBMODULES:
    legacy_name = f"donkeycar.{module_name}"
    alias_name = f"{__name__}.{module_name}"
    sys.modules[alias_name] = importlib.import_module(legacy_name)
