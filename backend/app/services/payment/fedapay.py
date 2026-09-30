"""Provider de paiement : FedaPay (Mobile Money Benin)."""

import hashlib
import hmac
import json
from typing import Any, Dict

import httpx

from app.core.config import get_settings
from app.core.errors import PaymentError
from app.core.logging import get_logger
from app.services.payment.base import PaymentProvider
from app.services.payment.schemas import (
    PaymentIntent,
    PaymentProviderName,
    PaymentResult,
    PaymentStatus,
    WebhookPayload,
)

logger = get_logger("payment.fedapay")


FEDAPAY_API_URL_SANDBOX = "https://sandbox-api.fedapay.com/v1"
FEDAPAY_API_URL_LIVE = "https://api.fedapay.com/v1"


class FedaPayProvider(PaymentProvider):
    name = "fedapay"

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_available(self) -> bool:
        return bool(self.settings.fedapay_secret_key)

    def _api_url(self) -> str:
        if self.settings.fedapay_env == "live":
            return FEDAPAY_API_URL_LIVE
        return FEDAPAY_API_URL_SANDBOX

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.fedapay_secret_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def create_checkout(self, intent: PaymentIntent) -> PaymentResult:
        """Cree une transaction FedaPay et retourne l URL de paiement."""
        url = f"{self._api_url()}/transactions"

        payload = {
            "description": intent.description or f"Achat plan {intent.plan_code}",
            "amount": int(intent.amount),
            "currency": {"iso": intent.currency},
            "callback_url": f"{self.settings.frontend_url}/billing/return",
            "customer": {
                "email": intent.customer_email or f"{intent.user_id}@candidatia.com",
                "firstname": (intent.customer_name or "Client").split(" ")[0],
                "lastname": (intent.customer_name or "Client").split(" ")[-1],
            },
            "metadata": {
                **intent.metadata,
                "user_id": intent.user_id,
                "plan_code": intent.plan_code,
                "credits_to_add": intent.credits_to_add,
            },
        }

        logger.info(
            "fedapay_create_transaction",
            amount=intent.amount,
            currency=intent.currency,
            plan=intent.plan_code,
            env=self.settings.fedapay_env,
        )

        try:
            with httpx.Client(timeout=30) as client:
                response = client.post(url, headers=self._headers(), json=payload)

                if response.status_code not in (200, 201):
                    logger.error(
                        "fedapay_create_failed",
                        status=response.status_code,
                        body=response.text[:500],
                    )
                    raise PaymentError(
                        message=f"FedaPay a refuse la transaction ({response.status_code}).",
                        details={"status": response.status_code, "body": response.text[:200]},
                    )

                data = response.json()

                # ============================================================
                # EXTRACTION ROBUSTE DE LA REPONSE FEDAPAY
                # FedaPay utilise la cle "v1/transaction" (avec un slash),
                # parfois "transaction", parfois la racine directement
                # ============================================================
                transaction: Dict[str, Any] = {}
                if "v1/transaction" in data:
                    transaction = data["v1/transaction"]
                elif "v1" in data and isinstance(data["v1"], dict):
                    v1 = data["v1"]
                    if "transaction" in v1 and isinstance(v1["transaction"], dict):
                        transaction = v1["transaction"]
                    else:
                        transaction = v1
                elif "transaction" in data and isinstance(data["transaction"], dict):
                    transaction = data["transaction"]
                else:
                    transaction = data

                transaction_id = str(transaction.get("id", ""))
                checkout_url = transaction.get("payment_url", "")

                logger.info(
                    "fedapay_response_parsed",
                    transaction_id=transaction_id,
                    has_payment_url=bool(checkout_url),
                    data_keys=list(data.keys()),
                    transaction_keys=list(transaction.keys()) if isinstance(transaction, dict) else [],
                )

                # Fallback : si pas de payment_url mais un ID, generer via /token
                if not checkout_url and transaction_id:
                    logger.info("fedapay_generating_token_fallback", transaction_id=transaction_id)
                    token_url = f"{self._api_url()}/transactions/{transaction_id}/token"
                    token_response = client.post(token_url, headers=self._headers())

                    if token_response.status_code in (200, 201):
                        token_data = token_response.json()
                        token = token_data.get("token")
                        if token:
                            if self.settings.fedapay_env == "live":
                                checkout_url = f"https://process.fedapay.com/{token}"
                            else:
                                checkout_url = f"https://sandbox-process.fedapay.com/{token}"

                # Verifications finales
                if not transaction_id:
                    raise PaymentError(
                        message="FedaPay n a pas retourne d ID de transaction.",
                        details={
                            "data_keys": list(data.keys()),
                            "transaction_keys": list(transaction.keys()) if isinstance(transaction, dict) else [],
                        },
                    )

                if not checkout_url:
                    raise PaymentError(
                        message="FedaPay n a pas retourne d URL de paiement.",
                        details={"transaction_keys": list(transaction.keys())},
                    )

                logger.info(
                    "fedapay_transaction_created",
                    transaction_id=transaction_id,
                    checkout_url=checkout_url[:60],
                )

                return PaymentResult(
                    provider=PaymentProviderName.FEDAPAY,
                    provider_transaction_id=transaction_id,
                    checkout_url=checkout_url,
                    status=PaymentStatus.PENDING,
                    amount=intent.amount,
                    currency=intent.currency,
                    raw_response=data,
                )

        except httpx.HTTPError as e:
            logger.exception("fedapay_http_error", error=str(e))
            raise PaymentError(
                message=f"Erreur reseau FedaPay : {str(e)}",
                details={"error": str(e)},
            ) from e

    def verify_webhook(self, headers: Dict[str, str], body: bytes) -> WebhookPayload:
        """Verifie la signature d un webhook FedaPay."""
        signature = headers.get("x-fedapay-signature") or headers.get("X-FedaPay-Signature")

        if not signature:
            raise PaymentError(message="Signature webhook FedaPay manquante.")

        if self.settings.fedapay_webhook_secret:
            expected = hmac.new(
                self.settings.fedapay_webhook_secret.encode("utf-8"),
                body,
                hashlib.sha256,
            ).hexdigest()

            if not hmac.compare_digest(signature, expected):
                logger.warning("fedapay_webhook_bad_signature")
                raise PaymentError(message="Signature webhook FedaPay invalide.")

        try:
            payload_data = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as e:
            raise PaymentError(message=f"Webhook FedaPay invalide : {str(e)}") from e

        # FedaPay webhook : "entity" contient la transaction
        entity = payload_data.get("entity", {})
        event = payload_data.get("name", "")

        transaction_id = str(entity.get("id", ""))
        status_raw = entity.get("status", "").lower()

        status_map = {
            "approved": PaymentStatus.SUCCESS,
            "transferred": PaymentStatus.SUCCESS,
            "pending": PaymentStatus.PENDING,
            "declined": PaymentStatus.FAILED,
            "canceled": PaymentStatus.CANCELLED,
            "refunded": PaymentStatus.REFUNDED,
        }
        status = status_map.get(status_raw, PaymentStatus.PENDING)

        # Extraire currency avec securite
        currency_obj = entity.get("currency")
        if isinstance(currency_obj, dict):
            currency = currency_obj.get("iso", "XOF")
        else:
            currency = "XOF"

        logger.info(
            "fedapay_webhook_received",
            transaction_id=transaction_id,
            event=event,
            status=status.value,
        )

        return WebhookPayload(
            provider=PaymentProviderName.FEDAPAY,
            provider_transaction_id=transaction_id,
            status=status,
            amount=float(entity.get("amount", 0)),
            currency=currency,
            metadata=entity.get("metadata", {}) or {},
            raw=payload_data,
        )