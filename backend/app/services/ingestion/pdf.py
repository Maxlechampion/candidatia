"""Extracteur PDF (pypdf + pdfplumber + OCR fallback)."""

import io

from app.core.logging import get_logger
from app.services.ingestion.base import DocumentExtractor

logger = get_logger("ingestion.pdf")


class PDFExtractor(DocumentExtractor):
    name = "pdf"
    extensions = ["pdf"]

    def extract(self, content_bytes: bytes, filename: str) -> str:
        text = self._extract_pypdf(content_bytes)

        if not text or len(text.strip()) < 50:
            logger.info("pdf_fallback_pdfplumber", filename=filename)
            text = self._extract_pdfplumber(content_bytes)

        if not text or len(text.strip()) < 50:
            logger.info("pdf_fallback_ocr", filename=filename)
            text = self._extract_ocr(content_bytes)

        return text

    @staticmethod
    def _extract_pypdf(content_bytes: bytes) -> str:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            pages = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    pages.append(page_text)
            return "\n".join(pages)
        except Exception as e:
            logger.warning("pypdf_failed", error=str(e))
            return ""

    @staticmethod
    def _extract_pdfplumber(content_bytes: bytes) -> str:
        try:
            import pdfplumber
            pages = []
            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pages.append(page_text)
            return "\n".join(pages)
        except Exception as e:
            logger.warning("pdfplumber_failed", error=str(e))
            return ""

    @staticmethod
    def _extract_ocr(content_bytes: bytes) -> str:
        """OCR de secours pour PDF scannes (necessite PyMuPDF optionnel)."""
        try:
            import fitz
            import pytesseract
            from PIL import Image

            doc = fitz.open(stream=content_bytes, filetype="pdf")
            texts = []
            for page in doc:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_text = pytesseract.image_to_string(img, lang="fra+eng")
                if page_text:
                    texts.append(page_text)
            return "\n".join(texts)
        except ImportError:
            logger.warning("ocr_not_available")
            return ""
        except Exception as e:
            logger.warning("ocr_failed", error=str(e))
            return ""
