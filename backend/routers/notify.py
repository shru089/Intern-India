"""
Notifications Router
====================
Endpoints to manage and test alert channels.

GET  /notify/status       — Check which channels are configured
POST /notify/test         — Send a test alert to all configured channels
POST /notify/whatsapp     — Send a custom WhatsApp message
"""

from __future__ import annotations

import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..utils.notifications import send_whatsapp_alert_sync, send_telegram_alert, broadcast_alert
from ..routers.auth import get_current_user
from ..models.user import UserInDB

router = APIRouter()


class MessageBody(BaseModel):
    message: str


# ── Status ────────────────────────────────────────────────────────────────────

@router.get("/status")
async def notification_status(_: UserInDB = Depends(get_current_user)):
    """Returns which notification channels are configured."""
    whatsapp_ok = all([
        os.getenv("TWILIO_ACCOUNT_SID"),
        os.getenv("TWILIO_AUTH_TOKEN"),
        os.getenv("WHATSAPP_TO"),
    ])
    telegram_ok = all([
        os.getenv("TELEGRAM_BOT_TOKEN"),
        os.getenv("TELEGRAM_CHAT_ID"),
    ])
    return {
        "whatsapp": {
            "configured": whatsapp_ok,
            "from": os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886"),
            "to": os.getenv("WHATSAPP_TO", "not set"),
        },
        "telegram": {
            "configured": telegram_ok,
            "chat_id": os.getenv("TELEGRAM_CHAT_ID", "not set"),
        },
    }


# ── Test blast ────────────────────────────────────────────────────────────────

@router.post("/test")
async def test_notifications(current_user: UserInDB = Depends(get_current_user)):
    """
    Fire a test alert to every configured channel.
    Great for verifying your Twilio sandbox setup.
    """
    plain = (
        f"👋 InternZen Test Alert!\n\n"
        f"Hello {current_user.full_name or current_user.email}!\n"
        f"Your notification channel is working correctly. 🎉\n\n"
        f"You'll receive real alerts here when high-match internships are scraped."
    )
    md = (
        f"👋 *InternZen Test Alert\\!*\n\n"
        f"Hello *{current_user.full_name or current_user.email}*\\!\n"
        f"Your notification channel is working correctly\\. 🎉\n\n"
        f"You'll receive real\\-time alerts when high\\-match internships are scraped\\."
    )
    results = broadcast_alert(md, plain_message=plain)
    if not any(results.values()):
        raise HTTPException(
            status_code=503,
            detail="No notification channels are configured. Add TWILIO_* or TELEGRAM_* vars to .env"
        )
    return {
        "message": "Test alert sent",
        "channels": results,
    }


# ── Custom WhatsApp message ───────────────────────────────────────────────────

@router.post("/whatsapp")
async def send_whatsapp(
    body: MessageBody,
    _: UserInDB = Depends(get_current_user),
):
    """Send a custom WhatsApp message to the configured WHATSAPP_TO number."""
    success = send_whatsapp_alert_sync(body.message)
    if not success:
        raise HTTPException(
            status_code=503,
            detail="WhatsApp send failed — check TWILIO_* credentials in .env"
        )
    return {"ok": True, "message": "WhatsApp message sent"}
