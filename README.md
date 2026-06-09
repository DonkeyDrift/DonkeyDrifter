# DonkeyDrifter

DonkeyDrifter is a Python autonomous driving and drifting robotics platform derived from Donkeycar. It keeps the modular Vehicle + Part architecture, Tub data workflow, training tools, simulator support, and Web UI workflows while establishing an independent DonkeyDrifter identity.

> Independent fork notice: DonkeyDrifter is derived from Donkeycar and is not affiliated with, sponsored by, or endorsed by the Donkeycar maintainers.

## Quick Start

```bash
pip install donkeydrifter
donkey createcar --path ~/mycar --template complete
cd ~/mycar
python manage.py drive
```

The CLI command remains `donkey` for compatibility with the Donkeycar ecosystem and existing vehicle projects.

For local development:

```bash
pip install -e ".[pc,dev]"
pytest
```

## Python Imports

Recommended for new DonkeyDrifter code:

```python
import donkeydrifter as dk
```

Legacy Donkeycar imports continue to work:

```python
import donkeycar as dk
```

Submodule imports are also compatible. New templates prefer `donkeydrifter`, while existing vehicle directories using `donkeycar` do not need to be changed immediately.

## Compatibility with Donkeycar

DonkeyDrifter is intentionally compatible with existing Donkeycar-based projects during the migration period:

- `pip install donkeydrifter` is the new package target.
- `import donkeydrifter as dk` is the recommended import path for new code.
- `import donkeycar as dk` remains supported as a compatibility path.
- CLI command remains `donkey`.
- Existing vehicle projects can migrate gradually.
- Existing `/api/*` Web UI paths and drive WebSocket protocols are not renamed in the first migration stage.

See [Donkeycar compatibility guide](docs/guide/donkeycar-compatibility.md) for details.

## Web UI

DonkeyDrifter includes a unified Web UI under `web_ui/`:

- Backend: FastAPI, default port `8000`.
- Frontend: React/Vite, default port `5188`.
- Integrated startup remains available through:

```bash
donkey installweb --path ./web_ui
donkey web
```

## Development

Common commands:

```bash
pytest
pytest donkeycar/tests/test_vehicle.py -q
python -m build --sdist --wheel
```

Web UI backend:

```bash
cd web_ui/backend
python -m pytest tests -q
```

Web UI frontend:

```bash
cd web_ui/frontend
npm run check
npm run lint
npm run build
```

## License

DonkeyDrifter uses the Apache License 2.0 as its primary project license.

DonkeyDrifter is derived from Donkeycar. Portions originating from Donkeycar remain licensed under the MIT License. See:

- [LICENSE](LICENSE)
- [LICENSES/MIT-donkeycar.txt](LICENSES/MIT-donkeycar.txt)
- [NOTICE](NOTICE)
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

## Acknowledgements

DonkeyDrifter is derived from the Donkeycar project:

https://github.com/autorope/donkeycar

We thank the Donkeycar maintainers and contributors for their work.

Some historical documentation links may still point to upstream Donkeycar resources. Such links are retained as attribution or compatibility references and may differ from DonkeyDrifter behavior.
