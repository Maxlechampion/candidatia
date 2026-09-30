"""
Router /webhooks — Reception des notifications providers.

Ces endpoints sont PUBLICS (pas de JWT) mais verifies par signature.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Request

from app.core.errors import PaymentError
from app.core.logging import get_logger
from app.services.payment.orchestrator import get_payment_orchestrator

logger = get_logger("router.webhooks")
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


async def _process_webhook(
    provider_name: str,
    request: Request,
) -> Dict[str, Any]:
    """Traite un webhook d un provider donne."""
    body = await request.body()
    headers = dict(request.headers)

    logger.info(
        "webhook_endpoint_called",
        provider=provider_name,
        body_size=len(body),
        headers_count=len(headers),
    )

    orchestrator = get_payment_orchestrator()

    try:
        result = orchestrator.handle_webhook(provider_name, headers, body)
        return {"status": "ok", **result}
    except PaymentError as e:
        logger.warning("webhook_payment_error", provider=provider_name, error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("webhook_unexpected_error", provider=provider_name, error=str(e))
        raise HTTPException(status_code=500, detail=f"Erreur webhook : {str(e)}")


@router.post("/fedapay", summary="Webhook FedaPay")
async def webhook_fedapay(request: Request) -> Dict[str, Any]:
    """Recoit les notifications de FedaPay."""
    return await _process_webhook("fedapay", request)


@router.post("/flutterwave", summary="Webhook Flutterwave")
async def webhook_flutterwave(request: Request) -> Dict[str, Any]:
    """Recoit les notifications de Flutterwave."""
    return await _process_webhook("flutterwave", request)


@router.post("/raenest", summary="Webhook Raenest")
async def webhook_raenest(request: Request) -> Dict[str, Any]:
    """Recoit les notifications de Raenest."""
    return await _process_webhook("raenest", request)
