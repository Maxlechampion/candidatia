"""Router /api/billing — Paiement et historique."""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.core.security import get_current_user
from app.services.payment.orchestrator import get_payment_orchestrator
from app.services.payment.plans import list_plans

logger = get_logger("router.billing")
router = APIRouter(prefix="/api/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    """Payload de demande de paiement."""
    plan_code: str = Field(..., description="Code du plan (essentiel, pro, carriere)")
    provider: str = Field(..., description="Provider (fedapay, flutterwave, raenest)")
    customer_name: Optional[str] = None


@router.get("/plans", summary="Liste des plans disponibles")
async def get_plans() -> Dict[str, Any]:
    """Retourne la liste des plans tarifaires."""
    return {"plans": list_plans()}


@router.get("/providers", summary="Providers de paiement disponibles")
async def get_providers() -> Dict[str, Any]:
    """Retourne les providers actuellement configures."""
    orchestrator = get_payment_orchestrator()
    return {"providers": orchestrator.available_providers()}


@router.post("/checkout", summary="Creer une session de paiement")
async def create_checkout(
    payload: CheckoutRequest,
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Cree une session de paiement pour un plan donne."""
    orchestrator = get_payment_orchestrator()

    try:
        result = orchestrator.create_checkout(
            user_id=user["id"],
            user_email=user["email"],
            plan_code=payload.plan_code,
            provider_name=payload.provider,
            customer_name=payload.customer_name or user.get("full_name"),
        )
        return result
    except Exception as e:
        logger.exception("checkout_endpoint_failed", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/payments", summary="Historique des paiements")
async def list_payments(
    user: Dict[str, Any] = Depends(get_current_user),
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """Retourne l historique des paiements de l utilisateur."""
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit doit etre entre 1 et 100.")

    orchestrator = get_payment_orchestrator()
    return orchestrator.list_user_payments(user["id"], limit=limit)
