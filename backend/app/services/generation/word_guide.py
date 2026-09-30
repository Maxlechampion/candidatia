"""
Generateur Word : Guide de preparation a l entretien.

Structure :
  - Titre (poste + entreprise)
  - Analyse des enjeux caches de l entreprise
  - Questions probables avec strategie de reponse
  - Questions a poser en fin d entretien
"""

from typing import Any, Dict

from docx import Document
from docx.shared import Pt

from app.core.logging import get_logger
from app.services.generation.base import DocumentGenerator
from app.services.generation.style import (
    ALIGN_CENTRE,
    COULEUR_PRIMAIRE,
    COULEUR_SECONDAIRE,
    ajouter_paragraphe,
    ajouter_puce,
    ajouter_titre_section,
    configurer_marges,
    configurer_style_normal,
)

logger = get_logger("generation.word_guide")


class WordGuideGenerator(DocumentGenerator):
    name = "word_guide"

    def build(self, data: Dict[str, Any], locale: Dict[str, Any]) -> Document:
        doc = Document()
        configurer_marges(doc, top=1.0, bottom=1.0, left=1.0, right=1.0)
        configurer_style_normal(doc, taille=11)

        # ============================================================
        # TITRE PRINCIPAL
        # ============================================================
        titre_poste = data.get("titre_poste", "Poste")
        nom_entreprise = data.get("nom_entreprise", "Entreprise")

        p_titre = doc.add_paragraph()
        r_titre = p_titre.add_run("GUIDE DE PREPARATION A L ENTRETIEN")
        r_titre.bold = True
        r_titre.font.size = Pt(16)
        r_titre.font.color.rgb = COULEUR_PRIMAIRE
        p_titre.alignment = ALIGN_CENTRE
        p_titre.paragraph_format.space_after = Pt(4)

        p_sous_titre = doc.add_paragraph()
        r_st = p_sous_titre.add_run(f"{titre_poste} — {nom_entreprise}")
        r_st.italic = True
        r_st.font.size = Pt(12)
        r_st.font.color.rgb = COULEUR_SECONDAIRE
        p_sous_titre.alignment = ALIGN_CENTRE
        p_sous_titre.paragraph_format.space_after = Pt(20)

        # ============================================================
        # 1. ENJEUX CACHES
        # ============================================================
        defis = data.get("defis_cles_entreprise", [])
        if defis:
            ajouter_titre_section(doc, "1. Analyse des enjeux caches de l entreprise")

            ajouter_paragraphe(
                doc,
                "Points sur lesquels insister lors de l entretien :",
                taille=10,
                italique=True,
                espace_apres=6,
            )

            for defi in defis:
                ajouter_puce(doc, defi, indent=0.15)

        # ============================================================
        # 2. QUESTIONS PROBABLES
        # ============================================================
        questions = data.get("questions_probables", [])
        if questions:
            ajouter_titre_section(doc, "2. Questions probables et strategies de reponse")

            for i, q in enumerate(questions, 1):
                # Question
                p_q = doc.add_paragraph()
                p_q.paragraph_format.space_before = Pt(10)
                p_q.paragraph_format.space_after = Pt(4)
                r_q = p_q.add_run(f"Question {i} : ")
                r_q.bold = True
                r_q.font.size = Pt(11)
                r_q.font.color.rgb = COULEUR_PRIMAIRE
                r_qtext = p_q.add_run(q.get("question", ""))
                r_qtext.bold = True
                r_qtext.font.size = Pt(11)

                # Intention du recruteur
                p_int = doc.add_paragraph()
                p_int.paragraph_format.left_indent = Pt(10)
                p_int.paragraph_format.space_after = Pt(3)
                r_int_l = p_int.add_run("Ce que le recruteur cherche : ")
                r_int_l.italic = True
                r_int_l.font.size = Pt(10)
                r_int_l.font.color.rgb = COULEUR_SECONDAIRE
                r_int_v = p_int.add_run(q.get("intention_recruteur", ""))
                r_int_v.italic = True
                r_int_v.font.size = Pt(10)

                # Strategie de reponse
                p_strat = doc.add_paragraph()
                p_strat.paragraph_format.left_indent = Pt(10)
                p_strat.paragraph_format.space_after = Pt(4)
                r_strat_l = p_strat.add_run("Votre strategie gagnante : ")
                r_strat_l.bold = True
                r_strat_l.font.size = Pt(10)
                r_strat_l.font.color.rgb = COULEUR_PRIMAIRE
                r_strat_v = p_strat.add_run(q.get("strategie_reponse", ""))
                r_strat_v.font.size = Pt(10)

        # ============================================================
        # 3. QUESTIONS A POSER
        # ============================================================
        questions_poser = data.get("questions_a_poser", [])
        if questions_poser:
            ajouter_titre_section(doc, "3. Vos questions pour marquer des points")

            ajouter_paragraphe(
                doc,
                "Posez au moins deux de ces questions en fin d entretien :",
                taille=10,
                italique=True,
                espace_apres=6,
            )

            for q in questions_poser:
                ajouter_puce(doc, q, indent=0.15)

        logger.info(
            "word_guide_built",
            poste=titre_poste,
            entreprise=nom_entreprise,
            nb_questions=len(questions),
        )

        return doc
