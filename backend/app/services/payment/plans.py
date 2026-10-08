"""
Definition des plans tarifaires CandidatIA.
"""
from typing import Any, Dict, List, Optional


PLANS: Dict[str, Dict[str, Any]] = {
    "essentiel": {
        "code": "essentiel",
        "name": "Essentiel",
        "credits": 50,
        "price_eur": 7.50,
        "description": "Ideal pour debuter : 50 credits pour decouvrir CandidatIA.",
        "features": [
            "50 credits IA",
            "Correction de CV",
            "Simulation d'entretien",
            "Support email",
        ],
        "highlight": False,
    },
    "pro": {
        "code": "pro",
        "name": "Pro",
        "credits": 150,
        "price_eur": 18.00,
        "description": "Le plus populaire : 150 credits pour une recherche active.",
        "features": [
            "150 credits IA",
            "Tout Essentiel +",
            "Lettres de motivation",
            "Optimisation LinkedIn",
            "Support prioritaire",
        ],
        "highlight": True,
    },
    "carriere": {
        "code": "carriere",
        "name": "Carriere",
        "credits": 400,
        "price_eur": 38.00,
        "description": "Pour les candidats ambitieux : 400 credits + coaching.",
        "features": [
            "400 credits IA",
            "Tout Pro +",
            "Coaching carriere 1-to-1",
            "Acces illimite aux modeles",
            "Support VIP",
        ],
        "highlight": False,
    },
}


PROVIDER_PRICES: Dict[str, Dict[str, float]] = {
    "fedapay": {
        "essentiel": 5000,
        "pro": 12000,
        "carriere": 25000,
    },
    "flutterwave": {
        "essentiel": 5000,
        "pro": 12000,
        "carriere": 25000,
    },
    "raenest": {
        "essentiel": 8.00,
        "pro": 19.50,
        "carriere": 41.00,
    },
}


PROVIDER_CURRENCY: Dict[str, str] = {
    "fedapay": "XOF",
    "flutterwave": "XOF",
    "raenest": "USD",
}


def list_plans() -> List[Dict[str, Any]]:
    """Retourne la liste de tous les plans."""
    return list(PLANS.values())


def get_plan(code: str) -> Optional[Dict[str, Any]]:
    """Retourne un plan par son code, ou None."""
    return PLANS.get(code.lower())


def get_price_for_provider(plan_code: str, provider_name: str) -> float:
    """Retourne le prix d un plan pour un provider donne."""
    plan_code = plan_code.lower()
    provider_name = provider_name.lower()

    if plan_code not in PLANS:
        raise ValueError(f"Plan inconnu : {plan_code}")
    if provider_name not in PROVIDER_PRICES:
        raise ValueError(f"Provider inconnu : {provider_name}")

    price = PROVIDER_PRICES[provider_name].get(plan_code)
    if price is None:
        raise ValueError(
            f"Prix non defini pour plan={plan_code} provider={provider_name}"
        )
    return float(price)


def get_currency_for_provider(provider_name: str) -> str:
    """Retourne la devise utilisee par un provider."""
    provider_name = provider_name.lower()
    currency = PROVIDER_CURRENCY.get(provider_name)
    if not currency:
        raise ValueError(f"Devise inconnue pour provider : {provider_name}")
    return currency


def format_price(amount: float, currency: str) -> str:
    """Formate un prix pour affichage."""
    currency = currency.upper()
    if currency == "XOF":
        return f"{int(amount):,}".replace(",", " ") + " FCFA"
    if currency == "USD":
        return f"${amount:.2f}"
    if currency == "EUR":
        return f"{amount:.2f} €"
    return f"{amount:.2f} {currency}"
