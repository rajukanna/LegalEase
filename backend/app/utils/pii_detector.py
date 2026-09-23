"""PII Detection and Redaction utility using regex patterns."""

import re
from typing import Dict, List, Tuple

# Standard PII Regex patterns
PATTERNS = {
    "SSN": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "PHONE": re.compile(r"\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b"),
    "EMAIL": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
    "CREDIT_CARD": re.compile(r"\b(?:\d{4}[- ]?){3}\d{4}\b"),
    "BANK_ROUTING": re.compile(r"\b(?:Routing|ABA)\s*#?:?\s*(\d{9})\b", re.IGNORECASE)
}


class PIIDetector:
    """Detects and redacts sensitive Personally Identifiable Information (PII)."""

    @classmethod
    def scan_text(cls, text: str) -> Dict[str, List[str]]:
        """Returns map of detected PII categories to matches."""
        results: Dict[str, List[str]] = {}
        for category, pattern in PATTERNS.items():
            matches = pattern.findall(text)
            if matches:
                # Normalize tuples if any from grouping
                normalized = [m if isinstance(m, str) else "-".join(m) for m in matches]
                results[category] = list(set(normalized))
        return results

    @classmethod
    def redact_text(cls, text: str) -> Tuple[str, int]:
        """Replaces detected PII tokens with safe placeholders.

        Returns (redacted_text, count_of_redactions).
        """
        redacted = text
        count = 0
        for category, pattern in PATTERNS.items():
            def replacer(match):
                nonlocal count
                count += 1
                return f"[REDACTED_{category}]"
            redacted = pattern.sub(replacer, redacted)
        return redacted, count
