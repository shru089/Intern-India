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
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
    "r",
    "scala",
    "html",
    "css",
    "react",
    "angular",
    "vue",
    "next.js",
    "node",
    "express",
    "django",
    "flask",
    "fastapi",
    "spring",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
    "docker",
    "kubernetes",
    "terraform",
    "ansible",
    "aws",
    "azure",
    "gcp",
    "linux",
    "git",
    "ci/cd",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "machine learning",
    "deep learning",
    "nlp",
    "computer vision",
    "data science",
    "data analysis",
    "analytics",
    "excel",
    "tableau",
    "power bi",
    "communication",
    "leadership",
    "teamwork",
    "agile",
    "scrum",
]

DEGREE_TYPES = [
    "b.tech",
    "btech",
    "m.tech",
    "mtech",
    "bca",
    "mca",
    "b.sc",
    "bsc",
    "m.sc",
    "msc",
    "bba",
    "mba",
    "b.a",
    "ba",
    "m.a",
    "ma",
    "ph.d",
    "phd",
]

# ── Gemini helper ─────────────────────────────────────────────────────────────

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-1.5-flash:generateContent"
)

_EXTRACT_PROMPT = """\
You are an advanced resume parser for an Indian internship matching platform. Extract structured information from the resume text below.
Focus on skills relevant to internships, education level, and location preferences for matching with government/rural opportunities.

Return ONLY valid JSON (no markdown, no extra text) with this exact shape:
{{
  "skills": ["<technical skills, soft skills, tools, languages>"],
  "education": ["<degree + institution + year>", ...],
  "experience_summary": "<2-3 sentence professional summary suitable for internships>",
  "suggested_domains": ["<industry domains like IT, Marketing, Finance, etc.>"],
  "suggested_locations": ["<preferred cities/states in India>"],
  "is_rural": <boolean - true if resume indicates rural background/location>,
  "education_level": "<undergraduate/postgraduate/doctorate>",
  "gpa": <float or null>,
  "internship_experience": <boolean - true if has any internship/project experience>
}}

Key guidelines:
- Extract only technical and professional skills (not personal traits unless relevant)
- For rural detection, look for mentions of village names, rural addresses, or agricultural backgrounds
- Normalize skill names (e.g., "Python programming" -> "Python")
- Include both technical and soft skills relevant to internships
- GPA should be extracted as a number if mentioned, otherwise null

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
            r = await client.post(_GEMINI_URL, params={"key": api_key}, json=payload)
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

    # Extract skills
    skills = sorted({s.title() for s in COMMON_SKILLS if s in lower})[:25]

    # Extract education
    education = sorted(
        {
            d.upper()
            for d in DEGREE_TYPES
            if d.replace(".", "") in lower.replace(".", "")
        }
    )

    # Basic rural detection
    rural_keywords = ["village", "rural", "gram", "panchayat", "block", "district"]
    is_rural = any(keyword in lower for keyword in rural_keywords)

    # Education level detection
    education_level = "undergraduate"
    if any(
        deg in lower for deg in ["m.tech", "mtech", "m.sc", "msc", "mba", "ma", "phd"]
    ):
        education_level = "postgraduate"
    elif "phd" in lower or "ph.d" in lower:
        education_level = "doctorate"

    # Internship experience detection
    internship_keywords = ["internship", "intern", "project", "experience", "worked"]
    internship_experience = any(keyword in lower for keyword in internship_keywords)

    # Basic GPA extraction
    gpa = None
    import re

    gpa_match = re.search(r"gpa[:\s]*([0-9]\.?[0-9]?)", lower)
    if gpa_match:
        try:
            gpa = float(gpa_match.group(1))
        except ValueError:
            pass

    return {
        "skills": skills,
        "education": education,
        "experience_summary": "Entry-level professional with technical skills.",
        "suggested_domains": ["Information Technology"] if skills else [],
        "suggested_locations": ["Delhi", "Mumbai", "Bangalore"]
        if not is_rural
        else ["Rural Areas"],
        "is_rural": is_rural,
        "education_level": education_level,
        "gpa": gpa,
        "internship_experience": internship_experience,
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
            return {
                "error": str(exc),
                "skills": [],
                "education": [],
                "experience_summary": "",
            }

    @staticmethod
    async def parse_docx(file: UploadFile) -> dict[str, Any]:
        try:
            text = await _read_docx(file)
            return await ResumeParser._extract(text)
        except Exception as exc:
            logger.error(f"DOCX parse failed: {exc}")
            return {
                "error": str(exc),
                "skills": [],
                "education": [],
                "experience_summary": "",
            }

    @staticmethod
    async def _extract(text: str) -> dict[str, Any]:
        base = {
            "raw_text_preview": text[:500],
            "word_count": len(text.split()),
            "ai_powered": False,
        }
        llm_result = await _gemini_extract(text)
        if llm_result:
            # Validate and clean LLM results
            validated_result = ResumeParser._validate_extraction(llm_result)
            base.update(validated_result)
            base["ai_powered"] = True
            logger.info("Resume parsed with Gemini AI ✓")
        else:
            base.update(_keyword_extract(text))
            logger.info("Resume parsed with keyword fallback")
        return base

    @staticmethod
    def _validate_extraction(result: dict[str, Any]) -> dict[str, Any]:
        """Validate and clean extracted data."""
        validated = {}

        # Validate skills
        skills = result.get("skills", [])
        if isinstance(skills, list):
            # Normalize and filter skills
            validated["skills"] = [
                skill.strip().title()
                for skill in skills
                if isinstance(skill, str) and len(skill.strip()) > 1
            ][:20]  # Limit to 20 skills
        else:
            validated["skills"] = []

        # Validate education
        education = result.get("education", [])
        if isinstance(education, list):
            validated["education"] = [
                edu.strip()
                for edu in education
                if isinstance(edu, str) and len(edu.strip()) > 3
            ][:5]  # Limit to 5 entries
        else:
            validated["education"] = []

        # Validate experience summary
        summary = result.get("experience_summary", "")
        if isinstance(summary, str) and len(summary.strip()) > 10:
            validated["experience_summary"] = summary.strip()[:500]  # Limit length
        else:
            validated["experience_summary"] = ""

        # Validate domains
        domains = result.get("suggested_domains", [])
        if isinstance(domains, list):
            validated["suggested_domains"] = [
                domain.strip().title()
                for domain in domains
                if isinstance(domain, str) and len(domain.strip()) > 1
            ][:10]
        else:
            validated["suggested_domains"] = []

        # Validate locations
        locations = result.get("suggested_locations", [])
        if isinstance(locations, list):
            validated["suggested_locations"] = [
                loc.strip().title()
                for loc in locations
                if isinstance(loc, str) and len(loc.strip()) > 1
            ][:10]
        else:
            validated["suggested_locations"] = []

        # Validate boolean fields
        validated["is_rural"] = bool(result.get("is_rural", False))
        validated["internship_experience"] = bool(
            result.get("internship_experience", False)
        )

        # Validate education level
        edu_level = result.get("education_level", "")
        if edu_level in ["undergraduate", "postgraduate", "doctorate"]:
            validated["education_level"] = edu_level
        else:
            validated["education_level"] = "undergraduate"  # Default

        # Validate GPA
        gpa = result.get("gpa")
        if isinstance(gpa, (int, float)) and 0 <= gpa <= 10:
            validated["gpa"] = float(gpa)
        else:
            validated["gpa"] = None

        return validated
