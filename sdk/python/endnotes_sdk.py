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
