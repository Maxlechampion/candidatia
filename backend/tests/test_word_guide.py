"""Tests du generateur Word Guide."""

import os

import pytest

from app.services.generation.word_guide import WordGuideGenerator


@pytest.fixture
def guide_data():
    return {
        "titre_poste": "Developpeur Python Senior",
        "nom_entreprise": "TechCorp",
        "defis_cles_entreprise": [
            "Refonte microservices",
            "Scalabilite 10x",
        ],
        "questions_probables": [
            {
                "question": "Comment gerez-vous les desaccords ?",
                "intention_recruteur": "Intelligence relationnelle",
                "strategie_reponse": "Privilegiez les donnees.",
            }
        ],
        "questions_a_poser": [
            "Quels sont vos KPI de succes a 6 mois ?",
        ],
    }


def test_guide_generates_file(guide_data, tmp_path):
    from app.core.config import get_settings
    settings = get_settings()
    settings.local_storage_path = str(tmp_path)

    gen = WordGuideGenerator()
    path = gen.generate(guide_data, {"country": "FR"}, "test_guide.docx")

    assert os.path.exists(path)
    assert os.path.getsize(path) > 0


def test_guide_with_no_questions(tmp_path):
    from app.core.config import get_settings
    settings = get_settings()
    settings.local_storage_path = str(tmp_path)

    data = {
        "titre_poste": "Test",
        "nom_entreprise": "Test",
        "defis_cles_entreprise": [],
        "questions_probables": [],
        "questions_a_poser": [],
    }

    gen = WordGuideGenerator()
    path = gen.generate(data, {}, "test_guide_empty.docx")

    assert os.path.exists(path)
