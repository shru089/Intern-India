"""
AI Matching Service
===================
Scores an internship against a student profile using a two-tier strategy:

1. **Semantic similarity** (preferred) — converts skills to embeddings with
   the lightweight `sentence-transformers/all-MiniLM-L6-v2` model and uses
   cosine similarity.  This means "Python developer" matches "Software
   Engineer (Python)" even without exact keyword overlap.

2. **Keyword overlap fallback** — used when the sentence-transformers library
   is not installed, mirroring the old behaviour.

Weights
-------
skills:    50 %
domain:    30 %
location:  20 %
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# ── Try to load sentence-transformers once at module level ────────────────────
_model = None
_use_semantic = False

try:
    from sentence_transformers import SentenceTransformer, util as st_util  # type: ignore

    _model = SentenceTransformer("all-MiniLM-L6-v2")
    _use_semantic = True
    logger.info("sentence-transformers loaded — semantic matching active ✓")
except ImportError:
    logger.warning(
        "sentence-transformers not installed — falling back to keyword matching. "
        "Run `pip install sentence-transformers` to enable semantic AI scoring."
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _tokenize(csv: str) -> set[str]:
    return {s.strip().lower() for s in (csv or "").split(",") if s.strip()}


def _list_to_text(items) -> str:
    """Accept list *or* comma-string."""
    if isinstance(items, list):
        return " ".join(items)
    return (items or "").replace(",", " ")


def _semantic_score(text_a: str, text_b: str) -> float:
    """Returns cosine similarity in [0, 1].  Returns 0 if either text is empty."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    try:
        emb_a = _model.encode(text_a, convert_to_tensor=True)
        emb_b = _model.encode(text_b, convert_to_tensor=True)
        return float(st_util.cos_sim(emb_a, emb_b).item())
    except Exception as exc:
        logger.warning(f"Semantic scoring failed: {exc}")
        return 0.0


def _keyword_skill_score(prof_skills_csv, job_skills_csv) -> float:
    prof = _tokenize(prof_skills_csv if isinstance(prof_skills_csv, str) else ",".join(prof_skills_csv or []))
    job = _tokenize(job_skills_csv or "")
    overlap = len(prof & job)
    return overlap / max(len(job), 1)


def _location_score(prof_loc_list, job_location: str) -> float:
    job_loc_lower = (job_location or "").lower()
    if isinstance(prof_loc_list, list):
        locs = {s.strip().lower() for s in prof_loc_list}
    else:
        locs = _tokenize(prof_loc_list or "")
    if not locs:
        return 0.0
    for loc in locs:
        if loc in job_loc_lower or job_loc_lower in loc or "remote" in job_loc_lower:
            return 1.0
    return 0.0


def _domain_score(prof_domain_list, job_domain: str) -> float:
    job_d = (job_domain or "").lower()
    if isinstance(prof_domain_list, list):
        domains = {s.strip().lower() for s in prof_domain_list}
    else:
        domains = _tokenize(prof_domain_list or "")
    if not domains:
        return 0.0
    for d in domains:
        if d in job_d or job_d in d:
            return 1.0
    if _use_semantic and job_d:
        prof_text = " ".join(domains)
        return _semantic_score(prof_text, job_d)
    return 0.0


# ── Public API ────────────────────────────────────────────────────────────────

def score_internship(prof: dict | Any, job: Any) -> float:
    """
    Score *job* against the student *prof*.

    `prof` can be:
    - A MongoDB dict  (keys: skills, pref_domains, pref_locations, location)
    - A SQLAlchemy StudentProfile object

    `job` must be a SQLAlchemy Internship object.

    Returns a float in [0, 100].
    """
    # Normalise profile access
    if isinstance(prof, dict):
        prof_skills = prof.get("skills", [])
        prof_domains = prof.get("pref_domains", [])
        prof_locs = prof.get("pref_locations", [])
    else:
        prof_skills = prof.skills or ""
        prof_domains = prof.pref_domains or ""
        prof_locs = prof.pref_locations or ""

    job_skills_text = job.required_skills or ""
    job_domain = job.domain or ""
    job_location = job.location or ""

    # ── Skills (50 %) ─────────────────────────────────────────────────────────
    if _use_semantic:
        prof_skills_text = _list_to_text(prof_skills)
        skill_score = _semantic_score(prof_skills_text, job_skills_text)
        # Blend with keyword overlap for robustness
        kw_score = _keyword_skill_score(prof_skills, job_skills_text)
        skill_score = 0.7 * skill_score + 0.3 * kw_score
    else:
        skill_score = _keyword_skill_score(prof_skills, job_skills_text)

    # ── Domain (30 %) ─────────────────────────────────────────────────────────
    domain_sc = _domain_score(prof_domains, job_domain)

    # ── Location (20 %) ──────────────────────────────────────────────────────
    loc_sc = _location_score(prof_locs, job_location)

    total = (0.50 * skill_score) + (0.30 * domain_sc) + (0.20 * loc_sc)
    return round(total * 100, 2)
