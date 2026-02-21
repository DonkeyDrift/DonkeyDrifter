from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from donkeycar import load_config
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ConfigLoadRequest(BaseModel):
    path: str

@router.post("/load")
async def load_config_route(request: ConfigLoadRequest):
    path = request.path
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Directory not found")
    
    config_path = os.path.join(path, 'myconfig.py')
    if not os.path.exists(config_path):
        alt_config_path = os.path.join(path, 'config.py')
        if os.path.exists(alt_config_path):
            config_path = alt_config_path
        else:
            raise HTTPException(status_code=404, detail="config.py not found in directory")

    try:
        cfg = load_config(config_path)
        # Convert config object to dict, filtering out non-serializable items if necessary
        # For now, we return a success message and maybe some key config items
        # returning the whole config might be too much or contain non-serializable objects
        
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
