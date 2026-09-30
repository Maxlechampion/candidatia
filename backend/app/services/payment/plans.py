"""
Definitions des plans tarifaires.

Chaque plan a :
  - code : identifiant interne
  - name : nom commercial
  - price_xof : prix en FCFA
  - price_eur : prix en EUR (pour Flutterwave)
  - price_usd : prix en USD (pour Raenest)
  - credits : nombre de packs inclus
"""

from typing import Any, Dict, List, Optional


PLANS: Dict[str, Dict[str, Any]] = {
    "essentiel": {
        "code": "essentiel",
        "name": "Essentiel",
        "description": "5 packs de candidature, sans filigrane",
        "price_xof": 3300,      # ~5 EUR
        "price_eur": 4.99,
        "price_usd": 5.49,
        "credits": 5,
        "features": [
            "5 packs de candidature",
            "CV methode STAR",
            "Lettre de motivation",
            "Guide d entretien",
            "Sans filigrane",
        ],
    },
    "pro": {
        "code": "pro",
        "name": "Pro",
        "description": "30 packs par mois + simulateur entretien",
        "price_xof": 9800,      # ~15 EUR
        "price_eur": 14.99,
        "price_usd": 16.49,
        "credits": 30,
        "features": [
            "30 packs par mois",
            "Tous les documents",
            "Simulateur entretien IA",
            "Suivi des candidatures",
            "Support prioritaire",
        ],
    },
    "carriere": {
        "code": "carriere",
        "name": "Carriere",
        "description": "Packs illimites + coaching IA",
        "price_xof": 26200,     # ~40 EUR
        "price_eur": 39.99,
        "price_usd": 43.99,
        "credits": 999999,      # Illimite
        "features": [
            "Packs illimites",
            "Coaching IA personnalise",
            "Optimisation LinkedIn",
            "Preparation salariale",
            "Support VIP",
        ],
    },
}


def get_plan(code: str) -> Optional[Dict[str, Any]]:
    """Retourne un plan par son code ou None."""
    return PLANS.get(code.lower())


def list_plans() -> List[Dict[str, Any]]:
    """Retourne la liste des plans disponibles."""
    return list(PLANS.values())


def get_price_for_provider(plan_code: str, provider: str) -> float:
    """Retourne le prix adapte au provider (XOF, EUR ou USD)."""
    plan = get_plan(plan_code)
    if not plan:
        raise ValueError(f"Plan inconnu : {plan_code}")

    if provider == "fedapay":
        return float(plan["price_xof"])
    elif provider == "flutterwave":
        return float(plan["price_eur"])
    elif provider == "raenest":
        return float(plan["price_usd"])
    else:
        return float(plan["price_xof"])


def get_currency_for_provider(provider: str) -> str:
    """Retourne la devise pour un provider."""
    if provider == "fedapay":
        return "XOF"
    elif provider == "flutterwave":
        return "EUR"
    elif provider == "raenest":
        return "USD"
    return "XOF"
