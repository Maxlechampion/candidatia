"""Router /api/generate — pipeline complet de generation de pack."""

import os
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.core.errors import AppError, GenerationError, IngestionError
from app.core.logging import get_logger
from app.services.ai.orchestrator import get_orchestrator
from app.services.ai.prompts import (
    get_cv_prompt,
    get_guide_prompt,
    get_lettre_prompt,
    get_relance_prompt,
)
from app.services.generation.pack_builder import get_pack_builder
from app.services.ingestion.detector import detect_content_type
from app.services.ingestion.service import get_ingestion_service
from app.services.language.detector import detect_language
from app.services.language.locale_map import get_locale_conventions

logger = get_logger("router.generation")
router = APIRouter(prefix="/api", tags=["generation"])


async def _extraire_entree(
    fichier: Optional[UploadFile],
    texte: Optional[str],
    label: str,
) -> str:
    """Extrait le texte depuis un fichier ou un texte brut."""
    settings = get_settings()
    service = get_ingestion_service()

    if fichier:
        content_bytes = await fichier.read()
        max_bytes = settings.max_file_size_mb * 1024 * 1024
        if len(content_bytes) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"{label} : fichier trop volumineux (max {settings.max_file_size_mb} MB).",
            )
        try:
            return service.extract_from_bytes(content_bytes, fichier.filename or "unknown")
        except IngestionError as e:
            raise HTTPException(status_code=e.status_code, detail=f"{label} : {e.message}")

    if texte:
        try:
            return service.extract_from_text(texte)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"{label} : {str(e)}")

    raise HTTPException(
        status_code=400,
        detail=f"{label} : fournir soit un fichier soit un texte.",
    )


@router.post("/generate", summary="Generer un pack complet de candidature")
async def generate_pack(
    fichier_profil: Optional[UploadFile] = File(None),
    fichier_offre: Optional[UploadFile] = File(None),
    texte_profil: Optional[str] = Form(None),
    texte_offre: Optional[str] = Form(None),
    output_language: str = Form("fr"),
    inclure_relance: bool = Form(False),
    relance_wait_days: int = Form(7),
):
    """
    Pipeline complet :
    1. Ingestion du profil et de l offre
    2. Detection langue + conventions culturelles
    3. Generation CV structure (IA)
    4. Generation Lettre + Guide + Relance (IA)
    5. Assemblage des documents Word
    6. Compression ZIP
    7. Retour du ZIP telechargeable
    """
    logger.info(
        "generate_start",
        output_language=output_language,
        inclure_relance=inclure_relance,
    )

    # ============================================================
    # 1. Extraction
    # ============================================================
    profil = await _extraire_entree(fichier_profil, texte_profil, "Profil")
    offre = await _extraire_entree(fichier_offre, texte_offre, "Offre")

    if len(profil) < 50:
        raise HTTPException(status_code=400, detail="Profil trop court (min 50 caracteres).")
    if len(offre) < 50:
        raise HTTPException(status_code=400, detail="Offre trop courte (min 50 caracteres).")

    # ============================================================
    # 2. Conventions culturelles
    # ============================================================
    locale = get_locale_conventions(output_language)
    logger.info("locale_resolved", language=output_language, country=locale.get("country"))

    orchestrator = get_orchestrator()

    # ============================================================
    # 3. CV
    # ============================================================
    try:
        sys_prompt, user_prompt = get_cv_prompt(profil, offre, locale, output_language)
        cv_data = orchestrator.generate_json(sys_prompt, user_prompt)
    except AppError:
        raise
    except Exception as e:
        logger.exception("cv_generation_failed", error=str(e))
        raise HTTPException(status_code=502, detail=f"Erreur generation CV : {str(e)}")

    # Contexte strategique pour harmoniser les autres documents
    coordonnees = cv_data.get("coordonnees", {})
    nom_candidat = coordonnees.get("nom_complet", "Candidat")
    analyse = cv_data.get("analyse", {})
    cv_contexte = (
        f"Candidat: {nom_candidat}\n"
        f"Poste vise: {cv_data.get('titre_professionnel', '')}\n"
        f"Score: {analyse.get('score_matching', 0)}/100\n"
        f"Points forts: {', '.join(analyse.get('points_forts', []))}\n"
        f"Strategie: {analyse.get('strategie_candidature', '')}"
    )

    # ============================================================
    # 4. Lettre
    # ============================================================
    try:
        sys_prompt, user_prompt = get_lettre_prompt(cv_contexte, offre, locale, output_language)
        lettre_data = orchestrator.generate_json(sys_prompt, user_prompt)
    except Exception as e:
        logger.exception("lettre_generation_failed", error=str(e))
        raise HTTPException(status_code=502, detail=f"Erreur generation Lettre : {str(e)}")

    # ============================================================
    # 5. Guide
    # ============================================================
    try:
        sys_prompt, user_prompt = get_guide_prompt(cv_contexte, offre, locale, output_language)
        guide_data = orchestrator.generate_json(sys_prompt, user_prompt)
    except Exception as e:
        logger.exception("guide_generation_failed", error=str(e))
        raise HTTPException(status_code=502, detail=f"Erreur generation Guide : {str(e)}")

    # ============================================================
    # 6. Relance (optionnel)
    # ============================================================
    relance_data = None
    if inclure_relance:
        try:
            entreprise = guide_data.get("nom_entreprise", "Entreprise")
            poste = guide_data.get("titre_poste", cv_data.get("titre_professionnel", "Poste"))
            sys_prompt, user_prompt = get_relance_prompt(
                nom_candidat, poste, entreprise, relance_wait_days, locale, output_language
            )
            relance_ia = orchestrator.generate_json(sys_prompt, user_prompt)
            relance_data = {
                "company_name": entreprise,
                "job_title": poste,
                "wait_days": relance_wait_days,
                "subject": relance_ia.get("subject", ""),
                "body": relance_ia.get("body", ""),
                "signature": relance_ia.get("signature", ""),
            }
        except Exception as e:
            logger.warning("relance_generation_failed", error=str(e))
            relance_data = None

    # ============================================================
    # 7. Assemblage des documents
    # ============================================================
    try:
        builder = get_pack_builder()
        pack_name = f"Pack_{nom_candidat.replace(' ', '_')}"
        result = builder.build_pack(
            cv_data=cv_data,
            lettre_data=lettre_data,
            guide_data=guide_data,
            relance_data=relance_data,
            locale=locale,
            pack_name=pack_name,
        )
    except GenerationError as e:
        logger.exception("pack_build_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Erreur assemblage : {e.message}")

    # ============================================================
    # 8. Retour du ZIP
    # ============================================================
    zip_path = result["zip_path"]
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=500, detail="Le ZIP n a pas ete cree.")

    logger.info("generate_success", zip_path=zip_path, documents=len(result["documents"]))

    return FileResponse(
        path=zip_path,
        filename=os.path.basename(zip_path),
        media_type="application/zip",
    )


@router.get("/generate/info", summary="Informations sur le pipeline de generation")
async def generate_info() -> dict:
    """Retourne les informations sur le pipeline (langues supportees, PDF dispo)."""
    from app.services.generation.pdf_export import pdf_disponible
    from app.services.language.locale_map import list_supported_locales

    return {
        "supported_languages": list_supported_locales(),
        "pdf_available": pdf_disponible(),
        "max_file_size_mb": get_settings().max_file_size_mb,
    }
