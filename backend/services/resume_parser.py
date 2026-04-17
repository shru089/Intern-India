"""
Resume Parser Service
=====================
Extracts structured profile data (skills, education, experience)
from uploaded PDF / DOCX resumes.

Strategy (two-tier):
1. **LLM extraction (preferred)** — sends resume text to Gemini Flash to
   return a structured JSON with skills, education, experience summary.
   Activated when `GEMINI_API_KEY` is set in the environment.

2. **Keyword fallback** — scans for a predefined list of tech skills and
   degree terms.  Always works offline, no API key required.
"""

from __future__ import annotations

import io
import json
import logging
import os
from typing import Any

import httpx
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# ── Keyword lists for the fallback parser ─────────────────────────────────────
COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "kotlin", "swift", "r", "scala",
    "html", "css", "react", "angular", "vue", "next.js", "node", "express",
    "django", "flask", "fastapi", "spring",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "terraform", "ansible",
    "aws", "azure", "gcp", "linux", "git", "ci/cd",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "machine learning", "deep learning", "nlp", "computer vision",
    "data science", "data analysis", "analytics", "excel", "tableau",
    "power bi", "communication", "leadership", "teamwork", "agile", "scrum",
]

DEGREE_TYPES = [
    "b.tech", "btech", "m.tech", "mtech", "bca", "mca",
    "b.sc", "bsc", "m.sc", "msc", "bba", "mba",
    "b.a", "ba", "m.a", "ma", "ph.d", "phd",
]

# ── Gemini helper ─────────────────────────────────────────────────────────────

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-1.5-flash:generateContent"
)

_EXTRACT_PROMPT = """\
You are a resume parser. Extract structured information from the resume text below.
Return ONLY valid JSON (no markdown, no extra text) with this exact shape:
{{
  "skills": ["<skill1>", "<skill2>", ...],
  "education": ["<degree + institution>", ...],
  "experience_summary": "<2-3 sentence professional summary>",
  "suggested_domains": ["<domain1>", "<domain2>"],
  "suggested_locations": ["<city1>", ...]
}}

Resume text:
{text}
"""


async def _gemini_extract(text: str) -> dict[str, Any] | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    prompt = _EXTRACT_PROMPT.format(text=text[:4000])
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                _GEMINI_URL, params={"key": api_key}, json=payload
            )
            r.raise_for_status()
            raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
            # Strip optional markdown fences
            raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            return json.loads(raw)
    except Exception as exc:
        logger.warning(f"Gemini resume extraction failed: {exc}")
        return None


# ── Keyword fallback ──────────────────────────────────────────────────────────

def _keyword_extract(text: str) -> dict[str, Any]:
    lower = text.lower()
    skills = sorted(
        {s.title() for s in COMMON_SKILLS if s in lower}
    )[:25]
    education = sorted(
        {d.upper() for d in DEGREE_TYPES if d.replace(".", "") in lower.replace(".", "")}
    )
    return {
        "skills": skills,
        "education": education,
        "experience_summary": "",
        "suggested_domains": [],
        "suggested_locations": [],
    }


# ── PDF / DOCX readers ────────────────────────────────────────────────────────

async def _read_pdf(file: UploadFile) -> str:
    import PyPDF2  # type: ignore

    data = await file.read()
    reader = PyPDF2.PdfReader(io.BytesIO(data))
    return "\n".join(p.extract_text() or "" for p in reader.pages)


async def _read_docx(file: UploadFile) -> str:
    from docx import Document  # type: ignore

    doc = Document(io.BytesIO(await file.read()))
    return "\n".join(p.text for p in doc.paragraphs)


# ── Public API ────────────────────────────────────────────────────────────────

class ResumeParser:
    """Parse resume files and extract relevant information."""

    @staticmethod
    async def parse_pdf(file: UploadFile) -> dict[str, Any]:
        try:
            text = await _read_pdf(file)
            return await ResumeParser._extract(text)
        except Exception as exc:
            logger.error(f"PDF parse failed: {exc}")
            return {"error": str(exc), "skills": [], "education": [], "experience_summary": ""}

    @staticmethod
    async def parse_docx(file: UploadFile) -> dict[str, Any]:
        try:
            text = await _read_docx(file)
            return await ResumeParser._extract(text)
        except Exception as exc:
            logger.error(f"DOCX parse failed: {exc}")
            return {"error": str(exc), "skills": [], "education": [], "experience_summary": ""}

    @staticmethod
    async def _extract(text: str) -> dict[str, Any]:
        base = {
            "raw_text_preview": text[:500],
            "word_count": len(text.split()),
            "ai_powered": False,
        }
        llm_result = await _gemini_extract(text)
        if llm_result:
            base.update(llm_result)
            base["ai_powered"] = True
            logger.info("Resume parsed with Gemini AI ✓")
        else:
            base.update(_keyword_extract(text))
            logger.info("Resume parsed with keyword fallback")
        return base