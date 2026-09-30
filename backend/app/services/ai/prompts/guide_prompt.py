"""Prompt pour la generation du guide d entretien."""

from typing import Any, Dict


def get_guide_prompt(
    cv_contexte: str,
    offre: str,
    locale: Dict[str, Any],
    output_language: str = "fr",
) -> tuple:
    """Retourne (system_prompt, user_prompt) pour generer un guide d entretien."""

    language_name = locale.get("language_name", "Francais")
    tone = locale.get("tone", "formel")

    system_prompt = (
        "Tu es un coach de dirigeants et negociateur de carrieres d elite.\n"
        "\n"
        "CONTEXTE CULTUREL :\n"
        f"- Langue de redaction : {language_name} (code: {output_language})\n"
        f"- Ton : {tone}\n"
        "\n"
        "DIRECTIVES DE CONTENU :\n"
        "\n"
        "1. defis_cles_entreprise : au-dela du texte de l offre, deduis les VRAIES craintes "
        "ou douleurs organisationnelles cachees (manque de leadership, dette technique, "
        "risques de retards...). 3 a 5 defis.\n"
        "\n"
        "2. questions_probables : 4 a 5 questions pointues dont AU MOINS UNE piege.\n"
        "   Pour chaque question :\n"
        "   - intention_recruteur : decryptage psychologique de la crainte masquee\n"
        "   - strategie_reponse : script tactique etape par etape utilisant les forces du CV\n"
        "\n"
        "3. questions_a_poser : 3 questions a forte valeur ajoutee que le candidat posera "
        "en fin d entretien pour se positionner en consultant.\n"
        "\n"
        "Genere un objet JSON strict :\n"
        "{\n"
        '  "titre_poste": "Intitule du poste",\n'
        '  "nom_entreprise": "Nom de l entreprise",\n'
        '  "defis_cles_entreprise": [\n'
        '    "Analyse de l enjeu business cache"\n'
        "  ],\n"
        '  "questions_probables": [\n'
        "    {\n"
        '      "question": "Question exigeante",\n'
        '      "intention_recruteur": "Decryptage de la crainte sous-jacente",\n'
        '      "strategie_reponse": "Script tactique"\n'
        "    }\n"
        "  ],\n"
        '  "questions_a_poser": [\n'
        '    "Question de haut niveau"\n'
        "  ]\n"
        "}"
    )

    user_prompt = (
        "CONTEXTE DU CV OPTIMISE :\n"
        f"{cv_contexte}\n"
        "\n"
        "OFFRE D EMPLOI CIBLE :\n"
        f"{offre}\n"
        "\n"
        "Genere le guide d entretien au format JSON strict."
    )

    return system_prompt, user_prompt