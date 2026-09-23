"""Contract diffing and comparative analysis service."""

import uuid
import difflib
from typing import List, Tuple
from app.models.document import DocumentChunk
from app.models.compare import (
    ClauseDiffItem,
    DiffChangeType,
    DocumentCompareResponse,
)


class ContractDiffEngine:
    """Computes clause-level structured diffs and plain-language impact analysis."""

    @staticmethod
    def _normalize(text: str) -> str:
        return " ".join(text.lower().split())

    @classmethod
    def compare_documents(
        cls,
        doc_id_1: str,
        doc_title_1: str,
        chunks_1: List[DocumentChunk],
        doc_id_2: str,
        doc_title_2: str,
        chunks_2: List[DocumentChunk]
    ) -> DocumentCompareResponse:
        """Compares two documents at the clause level, returning structured diffs with impact assessments."""
        diff_items: List[ClauseDiffItem] = []

        # Map by title or sequence
        map1 = {c.clause_title.lower().strip(): c for c in chunks_1}
        map2 = {c.clause_title.lower().strip(): c for c in chunks_2}

        all_titles = list(dict.fromkeys(list(map1.keys()) + list(map2.keys())))

        added_count = 0
        removed_count = 0
        modified_count = 0

        for title_key in all_titles:
            c1 = map1.get(title_key)
            c2 = map2.get(title_key)

            if c1 and not c2:
                # Removed
                removed_count += 1
                diff_items.append(ClauseDiffItem(
                    diff_id=str(uuid.uuid4()),
                    section_title=c1.clause_title,
                    change_type=DiffChangeType.REMOVED,
                    original_text=c1.text,
                    revised_text=None,
                    plain_explanation=f"Clause '{c1.clause_title}' was completely removed in the revised version.",
                    who_it_favors="May favor Disclosing/Drafting Party by eliminating protections",
                    impact_level="High"
                ))

            elif c2 and not c1:
                # Added
                added_count += 1
                diff_items.append(ClauseDiffItem(
                    diff_id=str(uuid.uuid4()),
                    section_title=c2.clause_title,
                    change_type=DiffChangeType.ADDED,
                    original_text=None,
                    revised_text=c2.text,
                    plain_explanation=f"New provision '{c2.clause_title}' was added in the revised version.",
                    who_it_favors="Favors the drafting party introducing the new restriction",
                    impact_level="Medium"
                ))

            elif c1 and c2:
                # Compare similarity
                ratio = difflib.SequenceMatcher(None, cls._normalize(c1.text), cls._normalize(c2.text)).ratio()
                if ratio < 0.96:
                    # Modified
                    modified_count += 1
                    diff_explanation, who_favors, impact = cls._analyze_clause_change(c1.clause_title, c1.text, c2.text)
                    diff_items.append(ClauseDiffItem(
                        diff_id=str(uuid.uuid4()),
                        section_title=c2.clause_title,
                        change_type=DiffChangeType.MODIFIED,
                        original_text=c1.text,
                        revised_text=c2.text,
                        plain_explanation=diff_explanation,
                        who_it_favors=who_favors,
                        impact_level=impact
                    ))

        # Overall summary determination
        if modified_count + added_count + removed_count == 0:
            summary = "Both document versions are substantively identical."
            overall = "Neutral"
        else:
            summary = (
                f"Comparison revealed {modified_count} modified clause(s), {added_count} newly added clause(s), "
                f"and {removed_count} removed clause(s). Substantive rights and obligations were altered."
            )
            overall = "Revised version introduces tighter restrictions favoring the drafting party."

        return DocumentCompareResponse(
            doc_id_1=doc_id_1,
            doc_id_2=doc_id_2,
            doc_title_1=doc_title_1,
            doc_title_2=doc_title_2,
            summary_of_changes=summary,
            overall_favor=overall,
            diff_items=diff_items,
            total_added=added_count,
            total_removed=removed_count,
            total_modified=modified_count
        )

    @staticmethod
    def _analyze_clause_change(title: str, text1: str, text2: str) -> Tuple[str, str, str]:
        """Plain-language heuristic analysis of what changed and who it favors."""
        t1_len = len(text1)
        t2_len = len(text2)

        # Look for restrictive keywords added in text2
        restrictive_keywords = ["sole discretion", "liquidated damages", "waive", "indemnify", "unilateral", "arbitration"]
        added_keywords = [k for k in restrictive_keywords if k in text2.lower() and k not in text1.lower()]

        if added_keywords:
            return (
                f"Clause modified to add restrictive terms ({', '.join(added_keywords)}), narrowing your rights or remedies.",
                "Favors Landlord / Drafting Party",
                "High"
            )
        elif t2_len > t1_len + 40:
            return (
                "Terms were expanded with additional requirements or conditions not present in the original.",
                "Favors Drafting Party",
                "Medium"
            )
        elif t1_len > t2_len + 40:
            return (
                "Specific conditions or tenant/counterparty rights appear to have been removed or simplified.",
                "Potentially favors drafting party by removing exceptions",
                "Medium"
            )
        else:
            return (
                "Wording was revised with minor adjustments to definitions or procedures.",
                "Balanced / Minor wording revision",
                "Low"
            )
