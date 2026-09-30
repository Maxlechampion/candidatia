#!/usr/bin/env node
/**
 * setup-phase2.js — CandidatIA
 * Phase 2 : Ingestion multi-format + détection langue/contenu
 *
 * Crée :
 *   - Services d'ingestion (PDF, DOCX, ODT, RTF, HTML, MD, OCR, texte brut)
 *   - Détection automatique du type de contenu (CV vs offre)
 *   - Détection de langue (langdetect)
 *   - Mapping langue → conventions culturelles
 *   - Router /api/ingest
 *   - Tests unitaires
 *
 * Usage : node setup-phase2.js
 * Prérequis : avoir exécuté setup-phase0.js et setup-phase1.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

// ============================================================
// UTILITAIRES
// ============================================================

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log('  OK  ' + relPath);
}

function writeLines(relPath, lines) {
  writeFile(relPath, lines.join('\n') + '\n');
}

function logHeader(title) {
  console.log('');
  console.log('='.repeat(70));
  console.log('  ' + title);
  console.log('='.repeat(70));
  console.log('');
}

function logStep(step) {
  console.log('');
  console.log('> ' + step);
}

// ============================================================
// VÉRIFICATIONS
// ============================================================

logHeader('CandidatIA — Setup Phase 2 : Ingestion multi-format');

if (!fs.existsSync(path.join(ROOT, 'backend', 'app', 'services', 'ai'))) {
  console.error('');
  console.error('  ERREUR : Le dossier backend/app/services/ai est introuvable.');
  console.error('  Execute d abord setup-phase0.js puis setup-phase1.js.');
  console.error('');
  process.exit(1);
}

console.log('  Racine du projet : ' + ROOT);
console.log('');

// ============================================================
// 1. INGESTION — BASE (interface abstraite)
// ============================================================

logStep('1. Ingestion — base.py');

writeLines('backend/app/services/ingestion/base.py', [
  '"""',
  'Interface abstraite de tout extracteur de document.',
  '',
  'Chaque extracteur (PDF, DOCX, ODT, etc.) implemente cette interface.',
  'Cela permet au service d ingestion de router automatiquement selon',
  'l extension du fichier sans connaitre les details d implementation.',
  '"""',
  '',
  'from abc import ABC, abstractmethod',
  '',
  'from app.core.errors import IngestionError',
  '',
  '',
  'class DocumentExtractor(ABC):',
  '    """Classe abstraite pour un extracteur de document."""',
  '',
  '    name: str = "base"',
  '    extensions: list = []',
  '',
  '    @abstractmethod',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        """Extrait le texte brut depuis les octets du fichier."""',
  '        ...',
  '',
  '    def can_handle(self, filename: str) -> bool:',
  '        """Retourne True si l extracteur gere l extension du fichier."""',
  '        if "." not in filename:',
  '            return False',
  '        ext = filename.rsplit(".", 1)[-1].lower()',
  '        return ext in self.extensions',
  '',
  '    def safe_extract(self, content_bytes: bytes, filename: str) -> str:',
  '        """Point d entree public. Gere les erreurs et le nettoyage."""',
  '        try:',
  '            text = self.extract(content_bytes, filename)',
  '        except IngestionError:',
  '            raise',
  '        except Exception as e:',
  '            raise IngestionError(',
  '                message=f"Erreur extraction {self.name}: {str(e)}",',
  '                details={"extractor": self.name, "filename": filename},',
  '            ) from e',
  '',
  '        cleaned = self._clean(text)',
  '        if not cleaned:',
  '            raise IngestionError(',
  '                message=f"Le fichier {filename} est vide ou illisible.",',
  '                details={"extractor": self.name, "filename": filename},',
  '            )',
  '        return cleaned',
  '',
  '    @staticmethod',
  '    def _clean(text: str) -> str:',
  '        """Nettoyage de base : suppression des espaces multiples et lignes vides."""',
  '        if not text:',
  '            return ""',
  '        lines = [line.rstrip() for line in text.splitlines()]',
  '        lines = [line for line in lines if line.strip()]',
  '        return "\\n".join(lines).strip()',
]);

// ============================================================
// 2. INGESTION — PDF
// ============================================================

logStep('2. Ingestion — pdf.py');

writeLines('backend/app/services/ingestion/pdf.py', [
  '"""Extracteur PDF (pypdf + pdfplumber + OCR fallback)."""',
  '',
  'import io',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.pdf")',
  '',
  '',
  'class PDFExtractor(DocumentExtractor):',
  '    name = "pdf"',
  '    extensions = ["pdf"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        """Extrait le texte via pypdf, avec fallback pdfplumber puis OCR."""',
  '        text = self._extract_pypdf(content_bytes)',
  '',
  '        if not text or len(text.strip()) < 50:',
  '            logger.info("pdf_pypdf_too_short_fallback_pdfplumber", filename=filename)',
  '            text = self._extract_pdfplumber(content_bytes)',
  '',
  '        if not text or len(text.strip()) < 50:',
  '            logger.info("pdf_too_short_fallback_ocr", filename=filename)',
  '            text = self._extract_ocr(content_bytes)',
  '',
  '        return text',
  '',
  '    @staticmethod',
  '    def _extract_pypdf(content_bytes: bytes) -> str:',
  '        try:',
  '            import pypdf',
  '            reader = pypdf.PdfReader(io.BytesIO(content_bytes))',
  '            pages = []',
  '            for page in reader.pages:',
  '                page_text = page.extract_text()',
  '                if page_text:',
  '                    pages.append(page_text)',
  '            return "\\n".join(pages)',
  '        except Exception as e:',
  '            logger.warning("pypdf_failed", error=str(e))',
  '            return ""',
  '',
  '    @staticmethod',
  '    def _extract_pdfplumber(content_bytes: bytes) -> str:',
  '        try:',
  '            import pdfplumber',
  '            pages = []',
  '            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:',
  '                for page in pdf.pages:',
  '                    page_text = page.extract_text()',
  '                    if page_text:',
  '                        pages.append(page_text)',
  '            return "\\n".join(pages)',
  '        except Exception as e:',
  '            logger.warning("pdfplumber_failed", error=str(e))',
  '            return ""',
  '',
  '    @staticmethod',
  '    def _extract_ocr(content_bytes: bytes) -> str:',
  '        """OCR de secours pour PDF scannes."""',
  '        try:',
  '            import fitz  # PyMuPDF, optionnel',
  '            import pytesseract',
  '            from PIL import Image',
  '',
  '            doc = fitz.open(stream=content_bytes, filetype="pdf")',
  '            texts = []',
  '            for page in doc:',
  '                pix = page.get_pixmap()',
  '                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)',
  '                page_text = pytesseract.image_to_string(img, lang="fra+eng")',
  '                if page_text:',
  '                    texts.append(page_text)',
  '            return "\\n".join(texts)',
  '        except ImportError:',
  '            logger.warning("ocr_not_available_missing_deps")',
  '            return ""',
  '        except Exception as e:',
  '            logger.warning("ocr_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 3. INGESTION — DOCX
// ============================================================

logStep('3. Ingestion — docx.py');

writeLines('backend/app/services/ingestion/docx.py', [
  '"""Extracteur Word .docx (python-docx + docx2txt)."""',
  '',
  'import io',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.docx")',
  '',
  '',
  'class DOCXExtractor(DocumentExtractor):',
  '    name = "docx"',
  '    extensions = ["docx"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        """Extrait le texte via python-docx, fallback docx2txt."""',
  '        text = self._extract_python_docx(content_bytes)',
  '',
  '        if not text or len(text.strip()) < 20:',
  '            logger.info("docx_python_docx_short_fallback_docx2txt", filename=filename)',
  '            text = self._extract_docx2txt(content_bytes)',
  '',
  '        return text',
  '',
  '    @staticmethod',
  '    def _extract_python_docx(content_bytes: bytes) -> str:',
  '        try:',
  '            from docx import Document',
  '            doc = Document(io.BytesIO(content_bytes))',
  '            parts = []',
  '            for para in doc.paragraphs:',
  '                if para.text.strip():',
  '                    parts.append(para.text)',
  '            for table in doc.tables:',
  '                for row in table.rows:',
  '                    cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]',
  '                    if cells:',
  '                        parts.append(" | ".join(cells))',
  '            return "\\n".join(parts)',
  '        except Exception as e:',
  '            logger.warning("python_docx_failed", error=str(e))',
  '            return ""',
  '',
  '    @staticmethod',
  '    def _extract_docx2txt(content_bytes: bytes) -> str:',
  '        try:',
  '            import docx2txt',
  '            return docx2txt.process(io.BytesIO(content_bytes))',
  '        except Exception as e:',
  '            logger.warning("docx2txt_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 4. INGESTION — ODT
// ============================================================

logStep('4. Ingestion — odt.py');

writeLines('backend/app/services/ingestion/odt.py', [
  '"""Extracteur OpenDocument .odt (odfpy)."""',
  '',
  'import io',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.odt")',
  '',
  '',
  'class ODTExtractor(DocumentExtractor):',
  '    name = "odt"',
  '    extensions = ["odt"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        try:',
  '            from odf import teletype',
  '            from odf.opendocument import load',
  '            from odf.text import P',
  '',
  '            doc = load(io.BytesIO(content_bytes))',
  '            paragraphs = doc.getElementsByType(P)',
  '            parts = []',
  '            for p in paragraphs:',
  '                text = teletype.extractText(p)',
  '                if text.strip():',
  '                    parts.append(text)',
  '            return "\\n".join(parts)',
  '        except Exception as e:',
  '            logger.warning("odt_extract_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 5. INGESTION — RTF
// ============================================================

logStep('5. Ingestion — rtf.py');

writeLines('backend/app/services/ingestion/rtf.py', [
  '"""Extracteur RTF (striprtf)."""',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.rtf")',
  '',
  '',
  'class RTFExtractor(DocumentExtractor):',
  '    name = "rtf"',
  '    extensions = ["rtf"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        try:',
  '            from striprtf.striprtf import rtf_to_text',
  '            raw = content_bytes.decode("utf-8", errors="ignore")',
  '            return rtf_to_text(raw)',
  '        except Exception as e:',
  '            logger.warning("rtf_extract_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 6. INGESTION — HTML
// ============================================================

logStep('6. Ingestion — html.py');

writeLines('backend/app/services/ingestion/html.py', [
  '"""Extracteur HTML (BeautifulSoup)."""',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.html")',
  '',
  '',
  'class HTMLExtractor(DocumentExtractor):',
  '    name = "html"',
  '    extensions = ["html", "htm"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        try:',
  '            from bs4 import BeautifulSoup',
  '            raw = content_bytes.decode("utf-8", errors="ignore")',
  '            soup = BeautifulSoup(raw, "html.parser")',
  '',
  '            for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):',
  '                tag.decompose()',
  '',
  '            return soup.get_text(separator="\\n", strip=True)',
  '        except Exception as e:',
  '            logger.warning("html_extract_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 7. INGESTION — MARKDOWN
// ============================================================

logStep('7. Ingestion — markdown.py');

writeLines('backend/app/services/ingestion/markdown.py', [
  '"""Extracteur Markdown (nettoyage du balisage)."""',
  '',
  'import re',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.markdown")',
  '',
  '',
  'class MarkdownExtractor(DocumentExtractor):',
  '    name = "markdown"',
  '    extensions = ["md", "markdown"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        try:',
  '            raw = content_bytes.decode("utf-8", errors="ignore")',
  '',
  '            # Suppression des blocs de code',
  '            raw = re.sub(r"```.*?```", "", raw, flags=re.DOTALL)',
  '            raw = re.sub(r"`[^`]+`", "", raw)',
  '',
  '            # Suppression des liens Markdown [texte](url) -> texte',
  '            raw = re.sub(r"\\[([^\\]]+)\\]\\([^\\)]+\\)", r"\\1", raw)',
  '',
  '            # Suppression des balises de titre, gras, italique',
  '            raw = re.sub(r"^#{1,6}\\s*", "", raw, flags=re.MULTILINE)',
  '            raw = re.sub(r"\\*\\*(.+?)\\*\\*", r"\\1", raw)',
  '            raw = re.sub(r"\\*(.+?)\\*", r"\\1", raw)',
  '            raw = re.sub(r"__(.+?)__", r"\\1", raw)',
  '            raw = re.sub(r"_(.+?)_", r"\\1", raw)',
  '',
  '            # Suppression des listes',
  '            raw = re.sub(r"^\\s*[-*+]\\s+", "", raw, flags=re.MULTILINE)',
  '            raw = re.sub(r"^\\s*\\d+\\.\\s+", "", raw, flags=re.MULTILINE)',
  '',
  '            # Suppression des lignes de separation',
  '            raw = re.sub(r"^[-=]{3,}$", "", raw, flags=re.MULTILINE)',
  '',
  '            return raw',
  '        except Exception as e:',
  '            logger.warning("markdown_extract_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 8. INGESTION — IMAGE OCR
// ============================================================

logStep('8. Ingestion — image_ocr.py');

writeLines('backend/app/services/ingestion/image_ocr.py', [
  '"""Extracteur image via OCR (Tesseract)."""',
  '',
  'import io',
  '',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  '',
  'logger = get_logger("ingestion.image_ocr")',
  '',
  '',
  'class ImageOCRExtractor(DocumentExtractor):',
  '    name = "image_ocr"',
  '    extensions = ["png", "jpg", "jpeg", "tiff", "tif", "bmp", "webp"]',
  '',
  '    def extract(self, content_bytes: bytes, filename: str) -> str:',
  '        try:',
  '            import pytesseract',
  '            from PIL import Image',
  '',
  '            img = Image.open(io.BytesIO(content_bytes))',
  '            text = pytesseract.image_to_string(img, lang="fra+eng")',
  '            return text',
  '        except ImportError as e:',
  '            logger.warning("ocr_missing_deps", error=str(e))',
  '            return ""',
  '        except Exception as e:',
  '            logger.warning("ocr_failed", error=str(e))',
  '            return ""',
]);

// ============================================================
// 9. INGESTION — TEXTE BRUT
// ============================================================

logStep('9. Ingestion — text_raw.py');

writeLines('backend/app/services/ingestion/text_raw.py', [
  '"""Nettoyage du texte brut colle par l utilisateur."""',
  '',
  'import re',
  '',
  '',
  'def clean_raw_text(text: str) -> str:',
  '    """Nettoie un texte brut : normalise les espaces et sauts de ligne."""',
  '    if not text:',
  '        return ""',
  '',
  '    # Normalisation des retours chariot',
  '    text = text.replace("\\r\\n", "\\n").replace("\\r", "\\n")',
  '',
  '    # Remplacement des tabulations par des espaces',
  '    text = text.replace("\\t", " ")',
  '',
  '    # Suppression des espaces multiples',
  '    text = re.sub(r"[ ]{2,}", " ", text)',
  '',
  '    # Suppression des lignes vides multiples',
  '    text = re.sub(r"\\n{3,}", "\\n\\n", text)',
  '',
  '    return text.strip()',
  '',
  '',
  'class TextRawExtractor:',
  '    """Extracteur pour le texte brut (pas de fichier)."""',
  '',
  '    name = "text_raw"',
  '',
  '    def extract(self, text: str) -> str:',
  '        cleaned = clean_raw_text(text)',
  '        if not cleaned:',
  '            raise ValueError("Le texte fourni est vide.")',
  '        return cleaned',
]);

// ============================================================
// 10. INGESTION — DÉTECTEUR DE TYPE DE CONTENU
// ============================================================

logStep('10. Ingestion — detector.py');

writeLines('backend/app/services/ingestion/detector.py', [
  '"""',
  'Detection automatique du type de contenu (CV vs offre d emploi).',
  '',
  'Utilise des mots-cles ponderes. Retourne : "cv" | "offre" | "inconnu"',
  '"""',
  '',
  'from typing import Dict, Tuple',
  '',
  '',
  'CV_KEYWORDS: Dict[str, int] = {',
  '    "experience professionnelle": 5,',
  '    "experiences professionnelles": 5,',
  '    "formation": 3,',
  '    "formations": 3,',
  '    "competences": 4,',
  '    "competences techniques": 5,',
  '    "competences humaines": 4,',
  '    "langues": 2,',
  '    "centres d interet": 3,',
  '    "centres d\u0027interet": 3,',
  '    "loisirs": 2,',
  '    "profil": 2,',
  '    "diplome": 3,',
  '    "master": 2,',
  '    "licence": 2,',
  '    "baccalaureat": 2,',
  '    "curriculum vitae": 5,',
  '    "cv": 3,',
  '    "parcours professionnel": 4,',
  '    "references": 2,',
  '    "missions": 2,',
  '    "poste occupe": 3,',
  '}',
  '',
  'OFFRE_KEYWORDS: Dict[str, int] = {',
  '    "nous recherchons": 5,',
  '    "nous recrutons": 5,',
  '    "rejoignez": 4,',
  '    "rejoindre notre equipe": 5,',
  '    "rejoindre notre equipe": 5,',
  '    "poste a pourvoir": 5,',
  '    "profil recherche": 5,',
  '    "missions principales": 4,',
  '    "vos missions": 4,',
  '    "votre mission": 4,',
  '    "ce que nous offrons": 4,',
  '    "avantages": 2,',
  '    "cdi": 3,',
  '    "cdd": 3,',
  '    "stage": 2,',
  '    "alternance": 2,',
  '    "freelance": 2,',
  '    "salaire": 3,',
  '    "remuneration": 3,',
  '    "package": 2,',
  '    "poste base a": 3,',
  '    "poste base": 3,',
  '    "lieu du poste": 4,',
  '    "date de debut": 3,',
  '    "candidature": 2,',
  '    "cv et lettre de motivation": 3,',
  '    "lettre de motivation": 2,',
  '    "entreprise recrute": 4,',
  '    "societe recrute": 4,',
  '    "groupe recrute": 4,',
  '    "candidater": 3,',
  '    "postuler": 3,',
  '    "offre d emploi": 5,',
  '    "offre demploi": 5,',
  '}',
  '',
  '',
  'def _normalize(text: str) -> str:',
  '    """Normalise pour la recherche de mots-cles."""',
  '    text = text.lower()',
  '    text = text.replace("\u00e9", "e").replace("\u00e8", "e").replace("\u00ea", "e")',
  '    text = text.replace("\u00e0", "a").replace("\u00e2", "a")',
  '    text = text.replace("\u00ee", "i").replace("\u00ef", "i")',
  '    text = text.replace("\u00f4", "o").replace("\u00f9", "u").replace("\u00fb", "u")',
  '    text = text.replace("\u00e7", "c")',
  '    text = text.replace("\u0027", " ")',
  '    return text',
  '',
  '',
  'def detect_content_type(text: str) -> Tuple[str, float]:',
  '    """',
  '    Detecte si le texte est un CV ou une offre d emploi.',
  '',
  '    Retourne : (type, confidence)',
  '      - type : "cv" | "offre" | "inconnu"',
  '      - confidence : score de 0.0 a 1.0',
  '    """',
  '    if not text or len(text.strip()) < 50:',
  '        return ("inconnu", 0.0)',
  '',
  '    normalized = _normalize(text)',
  '',
  '    cv_score = sum(weight for kw, weight in CV_KEYWORDS.items() if kw in normalized)',
  '    offre_score = sum(weight for kw, weight in OFFRE_KEYWORDS.items() if kw in normalized)',
  '',
  '    total = cv_score + offre_score',
  '    if total == 0:',
  '        return ("inconnu", 0.0)',
  '',
  '    if cv_score > offre_score:',
  '        confidence = cv_score / total',
  '        return ("cv", round(confidence, 2))',
  '    elif offre_score > cv_score:',
  '        confidence = offre_score / total',
  '        return ("offre", round(confidence, 2))',
  '    else:',
  '        return ("inconnu", 0.0)',
]);

// ============================================================
// 11. INGESTION — SERVICE (orchestrateur)
// ============================================================

logStep('11. Ingestion — service.py');

writeLines('backend/app/services/ingestion/service.py', [
  '"""Service d ingestion : route automatiquement vers le bon extracteur."""',
  '',
  'from typing import List, Optional',
  '',
  'from app.core.errors import IngestionError',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.base import DocumentExtractor',
  'from app.services.ingestion.docx import DOCXExtractor',
  'from app.services.ingestion.html import HTMLExtractor',
  'from app.services.ingestion.image_ocr import ImageOCRExtractor',
  'from app.services.ingestion.markdown import MarkdownExtractor',
  'from app.services.ingestion.odt import ODTExtractor',
  'from app.services.ingestion.pdf import PDFExtractor',
  'from app.services.ingestion.rtf import RTFExtractor',
  'from app.services.ingestion.text_raw import TextRawExtractor, clean_raw_text',
  '',
  'logger = get_logger("ingestion.service")',
  '',
  '',
  'class IngestionService:',
  '    """Service principal d ingestion."""',
  '',
  '    def __init__(self) -> None:',
  '        self._extractors: List[DocumentExtractor] = [',
  '            PDFExtractor(),',
  '            DOCXExtractor(),',
  '            ODTExtractor(),',
  '            RTFExtractor(),',
  '            HTMLExtractor(),',
  '            MarkdownExtractor(),',
  '            ImageOCRExtractor(),',
  '        ]',
  '        self._text_extractor = TextRawExtractor()',
  '',
  '    def extract_from_bytes(self, content_bytes: bytes, filename: str) -> str:',
  '        """Extrait le texte depuis un fichier binaire."""',
  '        if not content_bytes:',
  '            raise IngestionError(',
  '                message="Le fichier est vide.",',
  '                details={"filename": filename},',
  '            )',
  '',
  '        if not filename or "." not in filename:',
  '            raise IngestionError(',
  '                message="Nom de fichier invalide (extension manquante).",',
  '                details={"filename": filename},',
  '            )',
  '',
  '        for extractor in self._extractors:',
  '            if extractor.can_handle(filename):',
  '                logger.info(',
  '                    "extractor_selected",',
  '                    extractor=extractor.name,',
  '                    filename=filename,',
  '                )',
  '                return extractor.safe_extract(content_bytes, filename)',
  '',
  '        ext = filename.rsplit(".", 1)[-1].lower()',
  '        raise IngestionError(',
  '            message=f"Format .{ext} non supporte.",',
  '            details={',
  '                "filename": filename,',
  '                "supported": [e for ext in self._extractors for e in ext.extensions],',
  '            },',
  '        )',
  '',
  '    def extract_from_text(self, text: str) -> str:',
  '        """Nettoie et retourne un texte brut colle par l utilisateur."""',
  '        return self._text_extractor.extract(text)',
  '',
  '',
  '# Singleton',
  '_ingestion_service: Optional[IngestionService] = None',
  '',
  '',
  'def get_ingestion_service() -> IngestionService:',
  '    global _ingestion_service',
  '    if _ingestion_service is None:',
  '        _ingestion_service = IngestionService()',
  '    return _ingestion_service',
]);

// ============================================================
// 12. LANGUAGE — DETECTOR
// ============================================================

logStep('12. Language — detector.py');

writeLines('backend/app/services/language/detector.py', [
  '"""Detection de la langue source d un texte (langdetect)."""',
  '',
  'from typing import Optional',
  '',
  'from app.core.logging import get_logger',
  '',
  'logger = get_logger("language.detector")',
  '',
  '',
  'SUPPORTED_LANGUAGES = {',
  '    "fr": "Francais",',
  '    "en": "English",',
  '    "es": "Espanol",',
  '    "pt": "Portugues",',
  '    "de": "Deutsch",',
  '    "it": "Italiano",',
  '    "nl": "Nederlands",',
  '    "ar": "Arabic",',
  '    "zh-cn": "Chinese (Simplified)",',
  '    "zh-tw": "Chinese (Traditional)",',
  '    "ja": "Japanese",',
  '    "ko": "Korean",',
  '    "ru": "Russian",',
  '    "tr": "Turkish",',
  '    "hi": "Hindi",',
  '    "wo": "Wolof",',
  '    "sw": "Swahili",',
  '}',
  '',
  '',
  'def detect_language(text: str, default: str = "en") -> str:',
  '    """Detecte la langue d un texte. Retourne un code ISO 639-1."""',
  '    if not text or len(text.strip()) < 20:',
  '        return default',
  '',
  '    try:',
  '        from langdetect import detect, DetectorFactory',
  '        DetectorFactory.seed = 0  # Resultats deterministes',
  '',
  '        code = detect(text)',
  '        code = code.lower()',
  '',
  '        # Normalisation chinois',
  '        if code in ("zh-cn", "zh-tw", "zh"):',
  '            return "zh-cn"',
  '',
  '        # Si la langue est supportee, on la retourne',
  '        if code in SUPPORTED_LANGUAGES:',
  '            return code',
  '',
  '        # Sinon fallback sur l anglais',
  '        logger.info("language_unsupported_fallback", detected=code, fallback=default)',
  '        return default',
  '',
  '    except Exception as e:',
  '        logger.warning("language_detection_failed", error=str(e))',
  '        return default',
  '',
  '',
  'def get_language_name(code: str) -> str:',
  '    """Retourne le nom lisible d une langue."""',
  '    return SUPPORTED_LANGUAGES.get(code.lower(), code.upper())',
]);

// ============================================================
// 13. LANGUAGE — LOCALE MAP
// ============================================================

logStep('13. Language — locale_map.py');

writeLines('backend/app/services/language/locale_map.py', [
  '"""',
  'Mapping langue -> conventions culturelles du marche cible.',
  '',
  'Determine comment un CV / une lettre doit etre formate selon',
  'le pays ou la culture cible.',
  '"""',
  '',
  'from typing import Any, Dict',
  '',
  '',
  'LOCALE_CONVENTIONS: Dict[str, Dict[str, Any]] = {',
  '    "fr": {',
  '        "country": "FR",',
  '        "language_name": "Francais",',
  '        "cv_max_pages": 1,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "epistolaire_traditionnel",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "en": {',
  '        "country": "US",',
  '        "language_name": "English",',
  '        "cv_max_pages": 1,',
  '        "cv_include_photo": False,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "cover_letter_american",',
  '        "letter_max_words": 350,',
  '        "date_format": "MM/DD/YYYY",',
  '        "tone": "direct_professionnel",',
  '    },',
  '    "es": {',
  '        "country": "ES",',
  '        "language_name": "Espanol",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "carta_presentacion",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "pt": {',
  '        "country": "PT",',
  '        "language_name": "Portugues",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "carta_apresentacao",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "de": {',
  '        "country": "DE",',
  '        "language_name": "Deutsch",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "anschreiben_formel",',
  '        "letter_max_words": 450,',
  '        "date_format": "DD.MM.YYYY",',
  '        "tone": "tres_formel",',
  '    },',
  '    "it": {',
  '        "country": "IT",',
  '        "language_name": "Italiano",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "lettera_presentazione",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "nl": {',
  '        "country": "NL",',
  '        "language_name": "Nederlands",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": False,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "sollicitatiebrief",',
  '        "letter_max_words": 350,',
  '        "date_format": "DD-MM-YYYY",',
  '        "tone": "direct_professionnel",',
  '    },',
  '    "ar": {',
  '        "country": "AE",',
  '        "language_name": "Arabic",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": True,',
  '        "letter_format": "cover_letter_bilingue",',
  '        "letter_max_words": 350,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel_respectueux",',
  '    },',
  '    "zh-cn": {',
  '        "country": "CN",',
  '        "language_name": "Chinese (Simplified)",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": True,',
  '        "letter_format": "cover_letter_asiatique",',
  '        "letter_max_words": 300,',
  '        "date_format": "YYYY-MM-DD",',
  '        "tone": "humble_respectueux",',
  '    },',
  '    "ja": {',
  '        "country": "JP",',
  '        "language_name": "Japanese",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "rirekisho_shokumu",',
  '        "letter_max_words": 300,',
  '        "date_format": "YYYY-MM-DD",',
  '        "tone": "tres_formel_respectueux",',
  '    },',
  '    "ko": {',
  '        "country": "KR",',
  '        "language_name": "Korean",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "jagisoseo",',
  '        "letter_max_words": 350,',
  '        "date_format": "YYYY-MM-DD",',
  '        "tone": "formel_respectueux",',
  '    },',
  '    "ru": {',
  '        "country": "RU",',
  '        "language_name": "Russian",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "soprovoditelnoe_pismo",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD.MM.YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "tr": {',
  '        "country": "TR",',
  '        "language_name": "Turkish",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "ozel_letter",',
  '        "letter_max_words": 400,',
  '        "date_format": "DD.MM.YYYY",',
  '        "tone": "formel",',
  '    },',
  '    "hi": {',
  '        "country": "IN",',
  '        "language_name": "Hindi",',
  '        "cv_max_pages": 2,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": True,',
  '        "cv_include_marital_status": True,',
  '        "letter_format": "cover_letter_indien",',
  '        "letter_max_words": 350,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel_respectueux",',
  '    },',
  '    "wo": {',
  '        "country": "SN",',
  '        "language_name": "Wolof",',
  '        "cv_max_pages": 1,',
  '        "cv_include_photo": True,',
  '        "cv_include_age": False,',
  '        "cv_include_marital_status": False,',
  '        "letter_format": "lettre_francophone",',
  '        "letter_max_words": 350,',
  '        "date_format": "DD/MM/YYYY",',
  '        "tone": "formel",',
  '    },',
  '}',
  '',
  '',
  'DEFAULT_LOCALE = {',
  '    "country": "US",',
  '    "language_name": "English",',
  '    "cv_max_pages": 1,',
  '    "cv_include_photo": False,',
  '    "cv_include_age": False,',
  '    "cv_include_marital_status": False,',
  '    "letter_format": "cover_letter_american",',
  '    "letter_max_words": 350,',
  '    "date_format": "MM/DD/YYYY",',
  '    "tone": "direct_professionnel",',
  '}',
  '',
  '',
  'def get_locale_conventions(language_code: str) -> Dict[str, Any]:',
  '    """Retourne les conventions culturelles pour une langue donnee."""',
  '    code = language_code.lower().strip()',
  '    return LOCALE_CONVENTIONS.get(code, DEFAULT_LOCALE)',
]);

// ============================================================
// 14. ROUTER — INGESTION
// ============================================================

logStep('14. Router — ingestion.py');

writeLines('backend/app/routers/ingestion.py', [
  '"""Router /api/ingest — Point d entree unique pour l ingestion."""',
  '',
  'from typing import Optional',
  '',
  'from fastapi import APIRouter, File, Form, HTTPException, UploadFile',
  '',
  'from app.core.config import get_settings',
  'from app.core.errors import IngestionError',
  'from app.core.logging import get_logger',
  'from app.services.ingestion.detector import detect_content_type',
  'from app.services.ingestion.service import get_ingestion_service',
  'from app.services.language.detector import detect_language, get_language_name',
  'from app.services.language.locale_map import get_locale_conventions',
  '',
  'logger = get_logger("router.ingestion")',
  'router = APIRouter(prefix="/api", tags=["ingestion"])',
  '',
  '',
  '@router.post("/ingest", summary="Ingestion d un fichier ou texte brut")',
  'async def ingest(',
  '    fichier: Optional[UploadFile] = File(None),',
  '    texte: Optional[str] = Form(None),',
  '    content_type_hint: Optional[str] = Form(None),',
  '):',
  '    """',
  '    Ingere un document (fichier ou texte brut) et retourne :',
  '    - le texte nettoye',
  '    - la langue detectee',
  '    - le type de contenu (cv / offre / inconnu)',
  '    - les conventions culturelles associees',
  '    """',
  '    settings = get_settings()',
  '    service = get_ingestion_service()',
  '',
  '    # Validation : au moins un des deux',
  '    if not fichier and not texte:',
  '        raise HTTPException(',
  '            status_code=400,',
  '            detail="Fournir soit un fichier soit un texte.",',
  '        )',
  '',
  '    # 1. Extraction',
  '    if fichier:',
  '        content_bytes = await fichier.read()',
  '',
  '        # Verification taille',
  '        max_bytes = settings.max_file_size_mb * 1024 * 1024',
  '        if len(content_bytes) > max_bytes:',
  '            raise HTTPException(',
  '                status_code=413,',
  '                detail=f"Fichier trop volumineux (max {settings.max_file_size_mb} MB).",',
  '            )',
  '',
  '        try:',
  '            extracted = service.extract_from_bytes(content_bytes, fichier.filename or "unknown")',
  '        except IngestionError as e:',
  '            raise HTTPException(status_code=e.status_code, detail=e.message)',
  '',
  '        source = "file"',
  '        filename = fichier.filename',
  '    else:',
  '        try:',
  '            extracted = service.extract_from_text(texte)',
  '        except Exception as e:',
  '            raise HTTPException(status_code=400, detail=str(e))',
  '',
  '        source = "text"',
  '        filename = None',
  '',
  '    # 2. Detection langue',
  '    detected_language = detect_language(extracted)',
  '    language_name = get_language_name(detected_language)',
  '',
  '    # 3. Detection type de contenu',
  '    if content_type_hint in ("cv", "offre"):',
  '        detected_type = content_type_hint',
  '        confidence = 1.0',
  '    else:',
  '        detected_type, confidence = detect_content_type(extracted)',
  '',
  '    # 4. Conventions culturelles',
  '    locale_conventions = get_locale_conventions(detected_language)',
  '',
  '    logger.info(',
  '        "ingestion_success",',
  '        source=source,',
  '        filename=filename,',
  '        text_length=len(extracted),',
  '        language=detected_language,',
  '        content_type=detected_type,',
  '        confidence=confidence,',
  '    )',
  '',
  '    return {',
  '        "status": "ok",',
  '        "source": source,',
  '        "filename": filename,',
  '        "text": extracted,',
  '        "text_length": len(extracted),',
  '        "language": {',
  '            "code": detected_language,',
  '            "name": language_name,',
  '        },',
  '        "content_type": {',
  '            "type": detected_type,',
  '            "confidence": confidence,',
  '        },',
  '        "locale": locale_conventions,',
  '    }',
]);

// ============================================================
// 15. MISE À JOUR MAIN
// ============================================================

logStep('15. Mise a jour main.py (ajout router ingestion)');

const mainPath = path.join(ROOT, 'backend', 'app', 'main.py');
let mainContent = fs.readFileSync(mainPath, 'utf-8');

// Remplacer l'import
mainContent = mainContent.replace(
  'from app.routers import health',
  'from app.routers import health, ingestion'
);

// Ajouter le router dans create_app
mainContent = mainContent.replace(
  '    app.include_router(health.router)',
  '    app.include_router(health.router)\n    app.include_router(ingestion.router)'
);

fs.writeFileSync(mainPath, mainContent, 'utf-8');
console.log('  OK  backend/app/main.py (mis a jour)');

// ============================================================
// 16. TESTS
// ============================================================

logStep('16. Tests unitaires');

writeLines('backend/tests/test_ingestion_detector.py', [
  '"""Tests du detecteur de type de contenu."""',
  '',
  'from app.services.ingestion.detector import detect_content_type',
  '',
  '',
  'def test_detect_cv() -> None:',
  '    text = """',
  '    CURRICULUM VITAE',
  '    Jean Dupont',
  '    EXPERIENCE PROFESSIONNELLE',
  '    - Developpeur senior chez TechCorp',
  '    FORMATION',
  '    - Master en informatique',
  '    COMPETENCES TECHNIQUES',
  '    - Python, FastAPI, Docker',
  '    LANGUES',
  '    - Francais, Anglais',
  '    """',
  '    content_type, confidence = detect_content_type(text)',
  '    assert content_type == "cv"',
  '    assert confidence > 0.5',
  '',
  '',
  'def test_detect_offre() -> None:',
  '    text = """',
  '    Nous recherchons un developpeur Python',
  '    Rejoignez notre equipe dynamique !',
  '    Profil recherche : 5 ans d experience',
  '    Missions principales : developpement backend',
  '    Ce que nous offrons : CDI, salaire competitif',
  '    Poste base a Paris',
  '    """',
  '    content_type, confidence = detect_content_type(text)',
  '    assert content_type == "offre"',
  '    assert confidence > 0.5',
  '',
  '',
  'def test_detect_inconnu() -> None:',
  '    content_type, confidence = detect_content_type("Bonjour")',
  '    assert content_type == "inconnu"',
  '    assert confidence == 0.0',
]);

writeLines('backend/tests/test_language_detector.py', [
  '"""Tests du detecteur de langue."""',
  '',
  'from app.services.language.detector import detect_language, get_language_name',
  '',
  '',
  'def test_detect_french() -> None:',
  '    text = "Bonjour, je suis un developpeur passionne par les nouvelles technologies et j aime creer des applications."',
  '    assert detect_language(text) == "fr"',
  '',
  '',
  'def test_detect_english() -> None:',
  '    text = "Hello, I am a passionate developer who loves building web applications and solving complex problems."',
  '    assert detect_language(text) == "en"',
  '',
  '',
  'def test_detect_short_text_returns_default() -> None:',
  '    assert detect_language("hi") == "en"',
  '',
  '',
  'def test_get_language_name() -> None:',
  '    assert get_language_name("fr") == "Francais"',
  '    assert get_language_name("en") == "English"',
]);

writeLines('backend/tests/test_locale_map.py', [
  '"""Tests du mapping langue -> conventions culturelles."""',
  '',
  'from app.services.language.locale_map import get_locale_conventions',
  '',
  '',
  'def test_french_conventions() -> None:',
  '    conv = get_locale_conventions("fr")',
  '    assert conv["country"] == "FR"',
  '    assert conv["cv_include_photo"] is True',
  '    assert conv["letter_format"] == "epistolaire_traditionnel"',
  '',
  '',
  'def test_english_conventions() -> None:',
  '    conv = get_locale_conventions("en")',
  '    assert conv["country"] == "US"',
  '    assert conv["cv_include_photo"] is False',
  '    assert conv["letter_format"] == "cover_letter_american"',
  '',
  '',
  'def test_unknown_language_fallback() -> None:',
  '    conv = get_locale_conventions("xx")',
  '    assert conv["country"] == "US"  # Default',
  '',
  '',
  'def test_japanese_conventions() -> None:',
  '    conv = get_locale_conventions("ja")',
  '    assert conv["country"] == "JP"',
  '    assert conv["cv_include_photo"] is True',
  '    assert conv["cv_include_age"] is True',
]);

writeLines('backend/tests/test_text_raw.py', [
  '"""Tests du nettoyage de texte brut."""',
  '',
  'from app.services.ingestion.text_raw import clean_raw_text',
  '',
  '',
  'def test_clean_removes_multiple_spaces() -> None:',
  '    assert clean_raw_text("hello    world") == "hello world"',
  '',
  '',
  'def test_clean_removes_multiple_newlines() -> None:',
  '    result = clean_raw_text("a\\n\\n\\n\\nb")',
  '    assert "\\n\\n\\n" not in result',
  '',
  '',
  'def test_clean_handles_crlf() -> None:',
  '    result = clean_raw_text("a\\r\\nb")',
  '    assert "\\r" not in result',
  '',
  '',
  'def test_clean_empty_returns_empty() -> None:',
  '    assert clean_raw_text("") == ""',
  '    assert clean_raw_text("   ") == ""',
]);

writeLines('backend/tests/test_markdown_extractor.py', [
  '"""Tests de l extracteur Markdown."""',
  '',
  'from app.services.ingestion.markdown import MarkdownExtractor',
  '',
  '',
  'def test_markdown_removes_headers() -> None:',
  '    extractor = MarkdownExtractor()',
  '    content = b"# Titre\\n\\n## Sous-titre\\n\\nParagraphe normal."',
  '    result = extractor.safe_extract(content, "test.md")',
  '    assert "Titre" in result',
  '    assert "#" not in result',
  '',
  '',
  'def test_markdown_removes_bold() -> None:',
  '    extractor = MarkdownExtractor()',
  '    content = b"Ceci est **important** et _aussi_."',
  '    result = extractor.safe_extract(content, "test.md")',
  '    assert "**" not in result',
  '    assert "important" in result',
  '',
  '',
  'def test_markdown_removes_links() -> None:',
  '    extractor = MarkdownExtractor()',
  '    content = b"Voir [Google](https://google.com) pour plus."',
  '    result = extractor.safe_extract(content, "test.md")',
  '    assert "[" not in result',
  '    assert "Google" in result',
  '    assert "https://" not in result',
]);

writeLines('backend/tests/test_ingestion_service.py', [
  '"""Tests du service d ingestion."""',
  '',
  'import pytest',
  '',
  'from app.core.errors import IngestionError',
  'from app.services.ingestion.service import IngestionService',
  '',
  '',
  'def test_extract_from_text() -> None:',
  '    service = IngestionService()',
  '    result = service.extract_from_text("  Hello    world  ")',
  '    assert result == "Hello world"',
  '',
  '',
  'def test_extract_from_bytes_empty_raises() -> None:',
  '    service = IngestionService()',
  '    with pytest.raises(IngestionError):',
  '        service.extract_from_bytes(b"", "test.pdf")',
  '',
  '',
  'def test_extract_from_bytes_no_extension_raises() -> None:',
  '    service = IngestionService()',
  '    with pytest.raises(IngestionError):',
  '        service.extract_from_bytes(b"content", "noextension")',
  '',
  '',
  'def test_extract_from_bytes_unsupported_raises() -> None:',
  '    service = IngestionService()',
  '    with pytest.raises(IngestionError):',
  '        service.extract_from_bytes(b"content", "test.xyz")',
  '',
  '',
  'def test_extract_markdown_works() -> None:',
  '    service = IngestionService()',
  '    content = b"# Titre\\nContenu normal."',
  '    result = service.extract_from_bytes(content, "test.md")',
  '    assert "Titre" in result',
  '    assert "Contenu normal" in result',
]);

writeLines('backend/tests/test_ingest_router.py', [
  '"""Tests du router /api/ingest."""',
  '',
  'from fastapi.testclient import TestClient',
  '',
  '',
  'def test_ingest_text_only(client: TestClient) -> None:',
  '    response = client.post(',
  '        "/api/ingest",',
  '        data={"texte": "CURRICULUM VITAE Jean Dupont EXPERIENCE PROFESSIONNELLE Developpeur FORMATION Master informatique COMPETENCES Python Docker"},',
  '    )',
  '    assert response.status_code == 200',
  '    data = response.json()',
  '    assert data["status"] == "ok"',
  '    assert data["source"] == "text"',
  '    assert "text" in data',
  '    assert "language" in data',
  '    assert "content_type" in data',
  '    assert "locale" in data',
  '',
  '',
  'def test_ingest_no_input_returns_400(client: TestClient) -> None:',
  '    response = client.post("/api/ingest")',
  '    assert response.status_code == 400',
  '',
  '',
  'def test_ingest_with_content_type_hint(client: TestClient) -> None:',
  '    response = client.post(',
  '        "/api/ingest",',
  '        data={',
  '            "texte": "Texte quelconque mais assez long pour etre ingere correctement par notre systeme.",',
  '            "content_type_hint": "cv",',
  '        },',
  '    )',
  '    assert response.status_code == 200',
  '    data = response.json()',
  '    assert data["content_type"]["type"] == "cv"',
  '    assert data["content_type"]["confidence"] == 1.0',
]);

// ============================================================
// 17. GIT COMMIT
// ============================================================

logStep('17. Commit Git');

try {
  execSync('git add .', { cwd: ROOT, stdio: 'ignore' });
  execSync('git commit -m "feat: Phase 2 - Ingestion multi-format + detection langue/contenu"', {
    cwd: ROOT,
    stdio: 'ignore',
  });
  console.log('  OK  Commit Git effectue');
} catch (e) {
  console.log('  WARN  Git non disponible ou rien a commit (ignore)');
}

// ============================================================
// RÉSUMÉ
// ============================================================

logHeader('Phase 2 terminee avec succes');

console.log('  Fichiers crees :');
console.log('    - backend/app/services/ingestion/base.py');
console.log('    - backend/app/services/ingestion/pdf.py');
console.log('    - backend/app/services/ingestion/docx.py');
console.log('    - backend/app/services/ingestion/odt.py');
console.log('    - backend/app/services/ingestion/rtf.py');
console.log('    - backend/app/services/ingestion/html.py');
console.log('    - backend/app/services/ingestion/markdown.py');
console.log('    - backend/app/services/ingestion/image_ocr.py');
console.log('    - backend/app/services/ingestion/text_raw.py');
console.log('    - backend/app/services/ingestion/detector.py');
console.log('    - backend/app/services/ingestion/service.py');
console.log('    - backend/app/services/language/detector.py');
console.log('    - backend/app/services/language/locale_map.py');
console.log('    - backend/app/routers/ingestion.py');
console.log('    - backend/app/main.py (mis a jour)');
console.log('    - backend/tests/test_ingestion_detector.py');
console.log('    - backend/tests/test_language_detector.py');
console.log('    - backend/tests/test_locale_map.py');
console.log('    - backend/tests/test_text_raw.py');
console.log('    - backend/tests/test_markdown_extractor.py');
console.log('    - backend/tests/test_ingestion_service.py');
console.log('    - backend/tests/test_ingest_router.py');
console.log('');
console.log('  Validation Phase 2 :');
console.log('');
console.log('  1. Lancer les tests :');
console.log('     cd backend');
console.log('     .\\venv\\Scripts\\Activate.ps1');
console.log('     pytest');
console.log('');
console.log('  2. Demarrer le serveur :');
console.log('     uvicorn app.main:app --reload');
console.log('');
console.log('  3. Tester l endpoint /api/ingest (dans un autre terminal) :');
console.log('     irm -Method POST -Uri http://localhost:8000/api/ingest -Body @{texte="Votre texte ici"}');
console.log('');
console.log('  4. Ouvrir Swagger :');
console.log('     http://localhost:8000/docs');
console.log('');
console.log('  Prochaine etape : Phase 3 (Generation Word/PDF multi-culturel)');
console.log('');