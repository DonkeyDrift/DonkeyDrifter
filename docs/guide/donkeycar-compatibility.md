# Donkeycar Compatibility

DonkeyDrifter is derived from Donkeycar and keeps compatibility with existing Donkeycar-based vehicle projects during the migration period.

## Recommended new import

Use `donkeydrifter` for new DonkeyDrifter code:

```python
import donkeydrifter as dk
```

Submodule imports should also use the new namespace in new templates and new examples:

```python
from donkeydrifter.parts.tub_v2 import TubWriter
from donkeydrifter.vehicle import Vehicle
```

## Legacy import compatibility

Existing Donkeycar-style imports continue to work:

```python
import donkeycar as dk
from donkeycar.parts.tub_v2 import TubWriter
```

This compatibility layer exists so old vehicle directories, tutorials, and user scripts do not need to be migrated immediately.

## CLI compatibility

The CLI command remains `donkey`:

```bash
donkey createcar --path ~/mycar --template complete
donkey web
```

CLI command remains `donkey` for compatibility with existing Donkeycar scripts and documentation.

## What does not change in the first migration stage

- Existing vehicle directories are not modified automatically.
- Existing `donkeycar` imports remain supported.
- Existing `DONKEY_*` configuration keys are not renamed.
- Existing `/api/*` Web UI routes are not renamed.
- Existing drive WebSocket protocol paths are not renamed.

## Migration guidance

New projects should use `donkeydrifter` imports. Existing projects can migrate gradually when convenient. Do not perform blind global replacements in user car directories; test each vehicle project after changing imports.
