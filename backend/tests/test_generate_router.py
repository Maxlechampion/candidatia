"""Tests du router /api/generate (sans appel IA)."""

from fastapi.testclient import TestClient


def test_generate_info_endpoint(client: TestClient) -> None:
    response = client.get("/api/generate/info")
    assert response.status_code == 200

    data = response.json()
    assert "supported_languages" in data
    assert "pdf_available" in data
    assert "fr" in data["supported_languages"]
    assert "en" in data["supported_languages"]
    assert isinstance(data["pdf_available"], bool)


def test_generate_missing_input_returns_400(client: TestClient) -> None:
    response = client.post("/api/generate")
    assert response.status_code == 400


def test_generate_short_profil_returns_400(client: TestClient) -> None:
    response = client.post(
        "/api/generate",
        data={
            "texte_profil": "trop court",
            "texte_offre": "offre " * 30,
        },
    )
    assert response.status_code == 400


def test_generate_short_offre_returns_400(client: TestClient) -> None:
    response = client.post(
        "/api/generate",
        data={
            "texte_profil": "profil " * 20,
            "texte_offre": "court",
        },
    )
    assert response.status_code == 400
