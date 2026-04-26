from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import os

router = APIRouter(prefix="/xp-events", tags=["xp"])


class XPEventIn(BaseModel):
    user_id: str
    event_type: str  # e.g. "code_submit", "quest_complete", "daily_login"
    amount: int
    course_id: Optional[str] = None
    quest_id: Optional[str] = None
    rift_multiplier: float = 1.0


class XPEventResponse(BaseModel):
    success: bool
    awarded: int
    total_xp: int
    tokens: int
    streak_days: int
    message: str


# XP values per event type
XP_TABLE = {
    "code_submit": 25,
    "quest_complete": 100,
    "daily_login": 10,
    "course_complete": 500,
    "first_attempt": 15,
}


@router.post("/award", response_model=XPEventResponse)
async def award_xp(event: XPEventIn):
    """
    Award XP to a user for completing a course action.
    Applies rift multiplier if a rift is active.
    """
    base_amount = event.amount or XP_TABLE.get(event.event_type, 10)
    final_amount = int(base_amount * event.rift_multiplier)

    # TODO: Replace with real Supabase calls
    # For now returns mock data so frontend can wire up
    mock_total = 350 + final_amount
    mock_tokens = 120 + (final_amount // 5)
    mock_streak = 3

    return XPEventResponse(
        success=True,
        awarded=final_amount,
        total_xp=mock_total,
        tokens=mock_tokens,
        streak_days=mock_streak,
        message=f"+{final_amount} XP awarded for {event.event_type}! Nice one BROski\u267e\ufe0f",
    )


@router.get("/user/{user_id}", response_model=dict)
async def get_user_xp(user_id: str):
    """
    Get current XP, tokens, and streak for a user.
    Powers the HUD display.
    """
    # TODO: Replace with real Supabase query
    return {
        "user_id": user_id,
        "total_xp": 350,
        "tokens": 120,
        "streak_days": 3,
        "level": 4,
        "xp_to_next_level": 650,
    }


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Top students by XP — used for the global leaderboard."""
    # TODO: Replace with real Supabase query
    return {
        "leaderboard": [
            {"rank": 1, "username": "DevWarrior", "level": 12, "xp": 11200, "tokens": 4480},
            {"rank": 2, "username": "CodeQueen", "level": 10, "xp": 9800, "tokens": 3920},
            {"rank": 3, "username": "ByteBandit", "level": 9, "xp": 8450, "tokens": 3380},
        ],
        "total_students": 142,
    }
