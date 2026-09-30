"""Test direct de l'API FedaPay pour voir la vraie réponse."""

import json
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

secret_key = os.getenv("FEDAPAY_SECRET_KEY")
env = os.getenv("FEDAPAY_ENV", "sandbox")

print(f"FEDAPAY_SECRET_KEY : {secret_key[:20] if secret_key else 'VIDE'}...")
print(f"FEDAPAY_ENV : {env}")
print()

if not secret_key:
    print("ERREUR : FEDAPAY_SECRET_KEY manquant dans .env")
    exit(1)

api_url = "https://sandbox-api.fedapay.com/v1" if env == "sandbox" else "https://api.fedapay.com/v1"

headers = {
    "Authorization": f"Bearer {secret_key}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

payload = {
    "description": "Test transaction CandidatIA",
    "amount": 1000,
    "currency": {"iso": "XOF"},
    "callback_url": "http://localhost:3000/billing/return",
    "customer": {
        "email": "test@example.com",
        "firstname": "Test",
        "lastname": "User",
    },
}

print("Envoi de la requete a FedaPay...")
print()

try:
    with httpx.Client(timeout=30) as client:
        response = client.post(f"{api_url}/transactions", headers=headers, json=payload)

        print(f"Status HTTP : {response.status_code}")
        print()
        print("Reponse brute :")
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        print()
        print("=== CHAMPS DE PREMIER NIVEAU ===")
        print(list(data.keys()))
        
        if "v1" in data:
            print()
            print("=== CHAMPS DE data['v1'] ===")
            print(list(data["v1"].keys()))
            
            if "transaction" in data["v1"]:
                print()
                print("=== CHAMPS DE data['v1']['transaction'] ===")
                print(list(data["v1"]["transaction"].keys()))
except Exception as e:
    print(f"ERREUR : {type(e).__name__} : {e}")