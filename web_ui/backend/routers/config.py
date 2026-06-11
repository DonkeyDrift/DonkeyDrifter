from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from donkeycar import load_config
import logging
import tkinter as tk
from tkinter import filedialog
from starlette.concurrency import run_in_threadpool
import asyncio
import socket
import subprocess
import re

router = APIRouter()
logger = logging.getLogger(__name__)

TRAINING_CONFIG_KEYS = [
    'BATCH_SIZE',
    'TRAIN_TEST_SPLIT',
    'MAX_EPOCHS',
    'SHOW_PLOT',
    'USE_EARLY_STOP',
    'EARLY_STOP_PATIENCE',
    'LEARNING_RATE',
    'CREATE_TF_LITE',
    'PRUNE_VAL_LOSS_DEGRADATION_LIMIT',
]

SIMULATOR_CONFIG_KEYS = [
    'SIM_HOST',
    'DONKEY_GYM',
    'DONKEY_SIM_PATH',
    'DONKEY_GYM_ENV_NAME',
    'SIM_ARTIFICIAL_LATENCY',
]

class ConfigLoadRequest(BaseModel):
    path: str

class TrainingConfigSaveRequest(BaseModel):
    path: str
    enabled: bool
    config: dict

class SimulatorDiscoverRequest(BaseModel):
    car_path: str | None = None

class SimulatorSaveRequest(BaseModel):
    path: str
    config: dict

def _open_directory_dialog():
    try:
        root = tk.Tk()
        root.withdraw()
        # Try to bring the dialog to the front
        root.attributes('-topmost', True)
        directory = filedialog.askdirectory()
        root.destroy()
        return directory
    except Exception as e:
        logger.error(f"Error opening directory dialog: {e}")
        return None

@router.get("/select_directory")
async def select_directory():
    """
    Opens a native directory selection dialog and returns the selected path.
    This works when the backend is running on a machine with a GUI.
    """
    try:
        path = await run_in_threadpool(_open_directory_dialog)
        return {"path": path}
    except Exception as e:
        logger.error(f"Failed to select directory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/browser")
async def list_directories(path: str = None):
    """
    List directories in the given path for web-based file browser.
    If path is None, return directories in the user home.
    """
    if not path:
        path = os.path.expanduser("~")
    
    path = os.path.abspath(path)
    if not os.path.exists(path) or not os.path.isdir(path):
        raise HTTPException(status_code=404, detail="Directory not found")
        
    try:
        dirs = []
        for d in os.listdir(path):
            try:
                d_path = os.path.join(path, d)
                if os.path.isdir(d_path) and not d.startswith('.'):
                    dirs.append(d)
            except PermissionError:
                continue
        dirs.sort()
        parent = os.path.dirname(path)
        return {
            "current": path,
            "parent": parent if parent != path else None,
            "directories": dirs
        }
    except Exception as e:
        logger.error(f"Failed to list directories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/load")
async def load_config_route(request: ConfigLoadRequest):
    path = request.path
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Directory not found")
    
    config_path = os.path.join(path, 'config.py')
    if not os.path.exists(config_path):
        raise HTTPException(status_code=404, detail="config.py not found in directory")

    try:
        cfg = load_config(config_path)
        config_dict = {}
        for key in dir(cfg):
            if key.isupper():
                val = getattr(cfg, key)
                if isinstance(val, (str, int, float, bool, list, dict, tuple)) and not key.startswith('__'):
                    config_dict[key] = val

        return {
            "status": True,
            "message": f"Config loaded from {path}",
            "config": config_dict
        }
    except Exception as e:
        logger.error(f"Failed to load config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/load_myconfig")
async def load_myconfig_route(request: ConfigLoadRequest):
    """Load only myconfig.py (without merging config.py defaults)."""
    path = request.path
    myconfig_path = os.path.join(path, 'myconfig.py')

    if not os.path.exists(myconfig_path):
        return {"status": True, "config": {}}

    try:
        from donkeycar.config import Config
        cfg = Config()
        cfg.from_pyfile(myconfig_path)

        config_dict = {}
        for key in dir(cfg):
            if key.isupper():
                val = getattr(cfg, key)
                if isinstance(val, (str, int, float, bool, list, dict, tuple)) and not key.startswith('__'):
                    config_dict[key] = val

        return {
            "status": True,
            "message": f"myconfig loaded from {path}",
            "config": config_dict
        }
    except Exception as e:
        logger.error(f"Failed to load myconfig: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save_training")
async def save_training_config(request: TrainingConfigSaveRequest):
    """Save or remove training-related config keys in myconfig.py."""
    path = request.path
    myconfig_path = os.path.join(path, 'myconfig.py')

    lines = []
    if os.path.exists(myconfig_path):
        with open(myconfig_path, 'r') as f:
            lines = f.read().splitlines()

    if request.enabled:
        for key in TRAINING_CONFIG_KEYS:
            if key not in request.config:
                continue
            val = request.config[key]
            if isinstance(val, str):
                val_str = f'"{val}"'
            else:
                val_str = str(val)

            new_line = f'{key} = {val_str}'
            found = False
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped.startswith(key) and '=' in stripped:
                    lines[i] = new_line
                    found = True
                    break
            if not found:
                lines.append(new_line)
    else:
        lines = [
            line for line in lines
            if not any(
                line.strip().startswith(k) and '=' in line.strip()
                for k in TRAINING_CONFIG_KEYS
            )
        ]

    with open(myconfig_path, 'w') as f:
        f.write('\n'.join(lines))
        if lines and not lines[-1].endswith('\n'):
            f.write('\n')

    return {"status": True, "message": f"Training config saved to {myconfig_path}"}


# ---------------------------------------------------------------------------
# Simulator discovery helpers
# ---------------------------------------------------------------------------

SIMULATOR_DEFAULT_PORT = 9091
DISCOVER_TIMEOUT = 0.4          # seconds per host
DISCOVER_MAX_CONCURRENT = 64    # concurrent connection attempts


async def _check_host_port(host: str, port: int, timeout: float = DISCOVER_TIMEOUT):
    """Try to open a TCP connection to host:port and return latency info."""
    try:
        loop = asyncio.get_event_loop()
        start = loop.time()
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port), timeout=timeout
        )
        writer.close()
        await writer.wait_closed()
        latency = (loop.time() - start) * 1000
        return {"ip": host, "port": port, "latency_ms": round(latency, 1), "reachable": True}
    except Exception:
        return None


def _get_default_gateway():
    """Return the default gateway IP (WSL2 host or router)."""
    try:
        result = subprocess.run(
            ['ip', 'route', 'show'], capture_output=True, text=True
        )
        if result.returncode == 0:
            match = re.search(r'default via (\d+\.\d+\.\d+\.\d+)', result.stdout)
            if match:
                return match.group(1)
    except Exception:
        pass
    return None


def _get_local_subnet():
    """Return the 192.168.x prefix of the primary LAN interface, if any."""
    try:
        import psutil
        addrs = psutil.net_if_addrs()
        for iface, addr_list in addrs.items():
            for addr in addr_list:
                if addr.family == socket.AF_INET and addr.address.startswith("192.168."):
                    parts = addr.address.split('.')
                    return f"{parts[0]}.{parts[1]}.{parts[2]}"
    except Exception:
        pass

    # Fallback: parse 'ip route' for a 192.168.x.x source address
    try:
        result = subprocess.run(
            ['ip', 'route', 'show'], capture_output=True, text=True
        )
        for line in result.stdout.splitlines():
            match = re.search(r'src\s+(\d+\.\d+\.\d+\.\d+)', line)
            if match:
                ip = match.group(1)
                if ip.startswith("192.168."):
                    parts = ip.split('.')
                    return f"{parts[0]}.{parts[1]}.{parts[2]}"
    except Exception:
        pass

    return None


async def _discover_simulator_hosts(port: int = SIMULATOR_DEFAULT_PORT):
    """Scan common addresses and the local /24 subnet for open simulator ports."""
    candidates = []

    # 1. Always check localhost first
    candidates.append("127.0.0.1")

    # 2. Check default gateway (WSL2 host IP)
    gw = _get_default_gateway()
    if gw and gw not in candidates:
        candidates.append(gw)

    # 3. If we have a 192.168.x subnet, scan it (exclude .0 and .255)
    subnet = _get_local_subnet()
    if subnet:
        for i in range(1, 255):
            ip = f"{subnet}.{i}"
            if ip not in candidates:
                candidates.append(ip)

    # 4. Cap total candidates to avoid excessive scanning
    if len(candidates) > 300:
        candidates = candidates[:300]

    semaphore = asyncio.Semaphore(DISCOVER_MAX_CONCURRENT)

    async def _probe(host):
        async with semaphore:
            return await _check_host_port(host, port)

    tasks = [_probe(host) for host in candidates]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    found = []
    for r in results:
        if isinstance(r, dict) and r.get("reachable"):
            found.append(r)

    # Sort by latency (fastest first)
    found.sort(key=lambda x: x["latency_ms"])
    return found


@router.post("/discover_simulator")
async def discover_simulator(request: SimulatorDiscoverRequest):
    """Scan the local network for DonkeySim instances listening on port 9091."""
    try:
        found = await _discover_simulator_hosts()
        return {"status": True, "found": found, "count": len(found)}
    except Exception as e:
        logger.error(f"Simulator discovery failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save_simulator")
async def save_simulator_config(request: SimulatorSaveRequest):
    """Save simulator-related config keys in myconfig.py."""
    path = request.path
    myconfig_path = os.path.join(path, 'myconfig.py')

    lines = []
    if os.path.exists(myconfig_path):
        with open(myconfig_path, 'r') as f:
            lines = f.read().splitlines()

    for key in SIMULATOR_CONFIG_KEYS:
        if key not in request.config:
            continue
        val = request.config[key]
        if isinstance(val, str):
            val_str = f'"{val}"'
        else:
            val_str = str(val)

        new_line = f'{key} = {val_str}'
        found = False
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith(key) and '=' in stripped:
                lines[i] = new_line
                found = True
                break
        if not found:
            lines.append(new_line)

    with open(myconfig_path, 'w') as f:
        f.write('\n'.join(lines))
        if lines and not lines[-1].endswith('\n'):
            f.write('\n')

    return {"status": True, "message": f"Simulator config saved to {myconfig_path}"}
