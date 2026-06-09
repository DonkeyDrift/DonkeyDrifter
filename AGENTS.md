# DonkeyDrifter Agent Guide

This file provides the essential context an AI coding agent needs to work effectively in the DonkeyDrifter repository.

## Project Overview

DonkeyDrifter is an independent Python autonomous driving and drifting robotics platform derived from Donkeycar. It keeps the modular Vehicle + Part architecture, Tub data workflow, training tools, simulator support, hardware integrations, and Web UI workflows while establishing an independent DonkeyDrifter identity.

- **Version**: `0.1.0` (defined in `donkeycar/_version.py`)
- **Python Requirement**: >=3.11.0, <3.12
- **Primary distribution package**: `donkeydrifter`
- **Recommended import**: `import donkeydrifter as dk`
- **Compatibility import**: `import donkeycar as dk`
- **CLI**: `donkey = donkeycar.management.base:execute_from_command_line`
- **License**: Apache License 2.0 for DonkeyDrifter changes, with upstream Donkeycar MIT License preserved in `LICENSES/MIT-donkeycar.txt`
- **Repository**: https://gitee.com/ffedu/donkeydrifter
- **Upstream source**: https://github.com/autorope/donkeycar

DonkeyDrifter is not affiliated with, sponsored by, or endorsed by the Donkeycar maintainers.

## Migration Contract

During the DonkeyDrifter migration:

- New code and templates should prefer `donkeydrifter` imports.
- Existing `donkeycar` imports must remain compatible.
- The CLI command remains `donkey`.
- Existing `DONKEY_*` configuration keys are not renamed in the first migration stage.
- Existing Web UI `/api/*` routes and drive WebSocket protocols are not renamed in the first migration stage.
- Upstream Donkeycar attribution and MIT License text must not be removed.

## Technology Stack

- **Core**: Python 3.11, NumPy, Pillow, OpenCV, Tornado, pandas, pyyaml
- **Machine Learning**: TensorFlow 2.15, Keras, PyTorch 2.1
- **Data**: Tub v2 format for training records
- **Telemetry**: paho-mqtt
- **Terminal UI**: rich, Kivy
- **Web UI Backend**: FastAPI, Uvicorn, python-multipart, Pydantic
- **Web UI Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand
- **Testing**: pytest, pytest-cov, responses, mypy
- **Build**: setuptools with `setup.cfg` and `pyproject.toml`

## Project Structure

```text
donkeydrifter/       # Public DonkeyDrifter import alias package
donkeycar/           # Current implementation package and legacy compatibility namespace
  vehicle.py         # Core Vehicle drive loop and PartProfiler
  memory.py          # Memory bus for inter-part communication
  config.py          # Config loader
  parts/             # Hardware drivers, controllers, neural nets, CV, data stores
  pipeline/          # Training pipeline
  management/        # CLI tooling and UIs
  templates/         # Vehicle application templates
docs/                # Architecture, guide, plan, validation, and migration docs
web_ui/              # FastAPI backend and React/Vite frontend
```

## Important Development Notes

- Treat `donkeydrifter` as the recommended public import path for new code.
- Preserve `donkeycar` compatibility unless the migration plan explicitly changes it.
- Keep `donkey` as the CLI command.
- Do not blindly replace every Donkeycar reference; upstream attribution, compatibility docs, and license text must keep the Donkeycar name where appropriate.
- When editing templates, new generated vehicle apps should use `import donkeydrifter as dk`.
- When editing Web UI routes, keep `/api` contracts stable unless a separate migration plan changes them.
- When changing license or attribution files, keep `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, and `LICENSES/MIT-donkeycar.txt` consistent.
