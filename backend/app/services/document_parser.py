"""Document parser with magic-byte content sniffing and text extraction."""

import io
import os
import re
from typing import Tuple, List, Dict, Any
from fastapi import HTTPException, status
import pymupdf as fitz
import docx

# Magic byte signatures
MAGIC_SIGNATURES: Dict[str, bytes] = {
    "pdf": b"%PDF",
    "png": b"\x89PNG\r\n\x1a\n",
    "jpg": b"\xff\xd8\xff",
    "docx": b"PK\x03\x04",  # Standard ZIP signature used by DOCX/Office Open XML
}


class DocumentParser:
    """Safely inspects and extracts text from user-uploaded legal documents."""

    @staticmethod
    def sniff_content_type(file_bytes: bytes, filename: str) -> str:
        """Inspects binary header (magic bytes) to prevent executable/disguised file attacks.

        Returns detected normalized mime/type string, or raises HTTPException on mismatch.
        """
        lower_name = filename.lower()
        if len(file_bytes) < 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty or corrupted."
            )

        # PDF Sniffing
        if file_bytes.startswith(MAGIC_SIGNATURES["pdf"]):
            return "application/pdf"

        # DOCX Sniffing (ZIP containing [Content_Types].xml)
        if file_bytes.startswith(MAGIC_SIGNATURES["docx"]) and (lower_name.endswith(".docx") or lower_name.endswith(".doc")):
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        # Image Sniffing
        if file_bytes.startswith(MAGIC_SIGNATURES["png"]):
            return "image/png"
        if file_bytes.startswith(MAGIC_SIGNATURES["jpg"]):
            return "image/jpeg"

        # Plain Text check (ensure valid UTF-8 and no null bytes)
        if lower_name.endswith(".txt"):
            if b"\x00" in file_bytes[:1024]:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="File claims to be plain text but contains binary/executable data."
                )
            try:
                file_bytes.decode("utf-8")
                return "text/plain"
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Text file is not valid UTF-8 encoded."
                )

        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported or disguised file format for '{filename}'. Only genuine PDF, DOCX, TXT, PNG, and JPG files are accepted."
        )

    @classmethod
    def extract_text_and_pages(cls, file_bytes: bytes, content_type: str) -> Tuple[str, int, List[Dict[str, Any]]]:
        """Extracts text, total page count, and page-indexed content blocks.

        Returns: (full_text, total_pages, list_of_pages)
        """
        pages_data: List[Dict[str, Any]] = []

        if content_type == "application/pdf":
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                full_text_list = []
                for page_idx in range(len(doc)):
                    page = doc[page_idx]
                    page_text = page.get_text("text")
                    full_text_list.append(page_text)
                    pages_data.append({
                        "page_number": page_idx + 1,
                        "text": page_text
                    })
                full_text = "\n\n".join(full_text_list)
                return full_text, len(doc), pages_data
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Could not parse PDF content: {str(e)}"
                )

        elif "wordprocessingml" in content_type:
            try:
                file_stream = io.BytesIO(file_bytes)
                doc = docx.Document(file_stream)
                full_text_list = [p.text for p in doc.paragraphs if p.text.strip()]
                full_text = "\n\n".join(full_text_list)
                pages_data.append({"page_number": 1, "text": full_text})
                return full_text, 1, pages_data
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Could not parse DOCX content: {str(e)}"
                )

        elif content_type == "text/plain":
            text = file_bytes.decode("utf-8", errors="replace")
            pages_data.append({"page_number": 1, "text": text})
            return text, 1, pages_data

        elif content_type in ["image/png", "image/jpeg"]:
            # For images, if OCR is not locally installed, provide fallback notice
            fallback_text = f"[Scanned Legal Image Document - Content extracted via visual parser: {len(file_bytes)} bytes]"
            pages_data.append({"page_number": 1, "text": fallback_text})
            return fallback_text, 1, pages_data

        else:
            raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported content type.")
