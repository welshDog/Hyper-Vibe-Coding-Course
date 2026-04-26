from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid

router = APIRouter(prefix="/rifts", tags=["rifts"])


class Rift(BaseModel):
    id: str
    topic: str
    multiplier: float
    expires_at: str
    description: str


class CreateRiftIn(BaseModel):
    topic: str
    multiplier: float = 2.0
    duration_minutes: int = 45
    description: str = ""


# In-memory rift store — swap for Supabase/Redis in production
_active_rift: Optional[dict] = None


@router.get("/active")
async def get_active_rift():
    """
    Returns the currently active rift if one exists and hasn't expired.
    Frontend polls this every 30s to show the banner.
    """
    global _active_rift

    if not _active_rift:
        return {"rift": None}

    expires = datetime.fromisoformat(_active_rift["expires_at"])
    if datetime.now(timezone.utc) > expires:
        _active_rift = None
        return {"rift": None}

    return {"rift": _active_rift}


@router.post("/create", response_model=dict)
async def create_rift(data: CreateRiftIn):
    """
    Fire a new rift event! Admin/teacher endpoint.
    E.g. '+2x XP for arrays challenges for next 45 minutes'
    """
    global _active_rift

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=data.duration_minutes)

    _active_rift = {
        "id": str(uuid.uuid4()),
        "topic": data.topic,
        "multiplier": data.multiplier,
        "expires_at": expires_at.isoformat(),
        "description": data.description or f"{data.multiplier}x XP on {data.topic} challenges!",
    }

    return {
        "success": True,
        "rift": _active_rift,
        "message": f"Rift OPENED: {data.topic} @ {data.multiplier}x XP for {data.duration_minutes} mins! \u26a1",
    }


@router.delete("/close")
async def close_rift():
    """Manually close the active rift."""
    global _active_rift
    _active_rift = None
    return {"success": True, "message": "Rift closed."}
