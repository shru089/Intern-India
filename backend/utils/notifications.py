"""
Notifications utility
=====================
Sends real-time alerts via:
  - WhatsApp  (Twilio API — preferred, works with phone number)
  - Telegram  (Bot API   — fallback / secondary channel)

Environment variables
---------------------
WhatsApp (Twilio):
  TWILIO_ACCOUNT_SID   — your Twilio Account SID
  TWILIO_AUTH_TOKEN    — your Twilio Auth Token
  TWILIO_WHATSAPP_FROM — Twilio WhatsApp sender, e.g. "whatsapp:+14155238886"
  WHATSAPP_TO          — recipient number,        e.g. "whatsapp:+919876543210"

Telegram (optional secondary channel):
  TELEGRAM_BOT_TOKEN
  TELEGRAM_CHAT_ID
"""

from __future__ import annotations

import os
import logging
import httpx
import asyncio

logger = logging.getLogger(__name__)


# ── WhatsApp via Twilio ───────────────────────────────────────────────────────

async def send_whatsapp_alert(message: str) -> bool:
    """
    Send a WhatsApp message via the Twilio API.

    How to set up (free sandbox for testing):
    1. Sign up at https://www.twilio.com/try-twilio
    2. Go to Messaging → Try it out → Send a WhatsApp message
    3. Join the sandbox by texting 'join <word>' to +1 415 523 8886
    4. Fill in TWILIO_* and WHATSAPP_TO in your .env
    """
    sid   = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_ = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    to    = os.getenv("WHATSAPP_TO")

    if not all([sid, token, to]):
        logger.warning(
            "WhatsApp credentials not configured — set TWILIO_ACCOUNT_SID, "
            "TWILIO_AUTH_TOKEN, WHATSAPP_TO in your .env"
        )
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    payload = {"From": from_, "To": to, "Body": message}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(url, data=payload, auth=(sid, token))
            r.raise_for_status()
            data = r.json()
            logger.info(f"WhatsApp alert sent  ✓  SID={data.get('sid')}")
            return True
    except httpx.HTTPStatusError as e:
        logger.error(f"WhatsApp send failed (HTTP {e.response.status_code}): {e.response.text}")
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
    return False


def send_whatsapp_alert_sync(message: str) -> bool:
    """Sync wrapper — use from non-async contexts (e.g. scheduler)."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Already inside an event loop (FastAPI context)
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, send_whatsapp_alert(message))
                return future.result(timeout=20)
        else:
            return loop.run_until_complete(send_whatsapp_alert(message))
    except Exception as e:
        logger.error(f"WhatsApp sync wrapper error: {e}")
        return False


# ── Telegram ──────────────────────────────────────────────────────────────────

def send_telegram_alert(message: str) -> bool:
    """Send a Markdown-formatted message via Telegram Bot API."""
    import requests  # sync — intentional for backward compat

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id   = os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        logger.warning("Telegram credentials not set — skipping.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info("Telegram alert sent ✓")
        return True
    except Exception as e:
        logger.error(f"Telegram send failed: {e}")
        return False


# ── Unified broadcast ─────────────────────────────────────────────────────────

def broadcast_alert(message: str, plain_message: str | None = None) -> dict:
    """
    Send to both WhatsApp and Telegram.
    WhatsApp doesn't support Markdown formatting, so pass `plain_message`
    for a cleaner WhatsApp version.

    Returns {"whatsapp": bool, "telegram": bool}
    """
    wa_msg = plain_message or message.replace("*", "").replace("`", "")
    results = {
        "whatsapp": send_whatsapp_alert_sync(wa_msg),
        "telegram": send_telegram_alert(message),
    }
    logger.info(f"Broadcast results: {results}")
    return results
