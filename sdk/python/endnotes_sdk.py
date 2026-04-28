from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Dict


class EndnotesApiError(Exception):
    def __init__(self, message: str, code: str, status: int, retryable: bool) -> None:
        super().__init__(message)
        self.code = code
        self.status = status
        self.retryable = retryable


class EndnotesClient:
    def __init__(self, api_key: str, base_url: str = "https://api.endnotes.ai/v1", timeout: int = 10) -> None:
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout

    def generate(self, draft: str, style: str = "numeric", output_format: str = "markdown") -> Dict[str, Any]:
        payload = {
            "draft": draft,
            "style": style,
            "outputFormat": output_format,
        }
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/endnotes:generate",
            data=body,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
                "X-Endnotes-Client": "endnotes-py/0.1.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            raw = error.read().decode("utf-8")
            parsed = json.loads(raw) if raw else {}
            details = parsed.get("error", {})
            raise EndnotesApiError(
                details.get("message", "Endnotes API request failed"),
                details.get("code", "unknown_error"),
                error.code,
                details.get("retryable", error.code >= 500),
            ) from error


def evaluate_trust_policy(
    response: Dict[str, Any],
    *,
    min_average_confidence: float = 0.8,
    min_citation_confidence: float = 0.7,
    allow_low_tier_sources: bool = False,
    max_stale_citations: int = 0,
    max_citations_below_threshold: int = 0,
) -> Dict[str, Any]:
    reliability = response.get("reliability", {})
    citations = response.get("citations", [])
    sources = response.get("sources", [])
    reasons = []

    average_confidence = float(reliability.get("averageConfidence", 0))
    citations_below_threshold = int(reliability.get("citationsBelowThreshold", 0))
    stale_citation_count = int(reliability.get("staleCitationCount", 0))
    low_tier_source_count = sum(1 for source in sources if source.get("qualityTier") == "low")
    low_confidence_citation_count = sum(
        1 for citation in citations if float(citation.get("confidence", 0)) < min_citation_confidence
    )

    if average_confidence < min_average_confidence:
        reasons.append("average_confidence_below_threshold")
    if citations_below_threshold > max_citations_below_threshold:
        reasons.append("citations_below_threshold_present")
    if stale_citation_count > max_stale_citations:
        reasons.append("stale_citations_present")
    if not allow_low_tier_sources and low_tier_source_count > 0:
        reasons.append("low_tier_sources_present")
    if low_confidence_citation_count > 0:
        reasons.append("citation_confidence_below_policy")

    return {
        "canPublish": len(reasons) == 0,
        "needsReview": len(reasons) > 0,
        "reasons": reasons,
        "summary": {
            "averageConfidence": average_confidence,
            "citationsBelowThreshold": citations_below_threshold,
            "staleCitationCount": stale_citation_count,
            "lowTierSourceCount": low_tier_source_count,
            "lowConfidenceCitationCount": low_confidence_citation_count,
        },
    }
