"""Gestion et verification des quotas par plan."""

from typing import Any, Dict

from app.core.config import get_settings
from app.core.errors import ForbiddenError
from app.core.logging import get_logger
from app.services.auth.user_service import get_user_by_id

logger = get_logger("auth.quota")


PLAN_QUOTAS: Dict[str, Dict[str, Any]] = {
    "free": {
        "name": "Decouverte",
        "monthly_credits": 1,
        "price_eur": 0,
    },
    "essentiel": {
        "name": "Essentiel",
        "total_credits": 5,
        "price_eur": 4.99,
    },
    "pro": {
        "name": "Pro",
        "monthly_credits": 30,
        "price_eur": 14.99,
    },
    "carriere": {
        "name": "Carriere",
        "monthly_credits": 999999,
        "price_eur": 39.99,
    },
}


def get_quota_info(user_id: str) -> Dict[str, Any]:
    """Retourne les informations de quota d un utilisateur."""
    user = get_user_by_id(user_id)
    plan = user.get("plan", "free")
    credits = user.get("credits", 0)
    plan_info = PLAN_QUOTAS.get(plan, PLAN_QUOTAS["free"])

    return {
        "user_id": user_id,
        "plan": plan,
        "plan_name": plan_info["name"],
        "credits_remaining": credits,
        "monthly_credits": plan_info.get("monthly_credits", 0),
        "price_eur": plan_info.get("price_eur", 0),
    }


def check_quota(user_id: str) -> None:
    """Verifie qu un utilisateur peut faire une generation."""
    user = get_user_by_id(user_id)
    credits = user.get("credits", 0)

    if credits <= 0:
        plan = user.get("plan", "free")
        logger.info("quota_exceeded", user_id=user_id, plan=plan)
        raise ForbiddenError(
            message="Quota epuise. Achetez des credits ou passez a un plan superieur.",
            details={
                "plan": plan,
                "credits_remaining": 0,
                "upgrade_url": "/api/billing/upgrade",
            },
        )
