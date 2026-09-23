"""Quick verification script for live Gemini API integration."""

import asyncio
from app.services.llm_service import get_llm_client
from app.prompts.grounded_chat import GROUNDED_CHAT_SYSTEM_PROMPT, format_grounded_chat_prompt
from app.models.chat import ChatCitation


async def main():
    client = get_llm_client()
    print("Active LLM Client:", type(client).__name__)

    # Test Grounded Query
    citations = [
        ChatCitation(
            clause_title="Section 12.1 Early Termination",
            section_reference="Section 12.1",
            page_number=1,
            quote_snippet="In the event Tenant vacates before the end of the term, Tenant forfeits deposit plus 3 months rent."
        )
    ]
    prompt = format_grounded_chat_prompt("What is the penalty if I move out early?", citations)
    res = await client.generate_json(GROUNDED_CHAT_SYSTEM_PROMPT, prompt)
    print("\n--- Live Gemini Grounded Answer ---")
    print("Answer:", res.get("answer"))
    print("Is Grounded:", res.get("is_grounded"))
    print("Citations:", res.get("cited_sections"))
    print("Disclaimer:", res.get("disclaimer"))

    # Test Ungrounded Refusal Query
    prompt_ungrounded = format_grounded_chat_prompt("What is the warranty period for the refrigerator?", [])
    res_ungrounded = await client.generate_json(GROUNDED_CHAT_SYSTEM_PROMPT, prompt_ungrounded)
    print("\n--- Live Gemini Ungrounded Refusal ---")
    print("Answer:", res_ungrounded.get("answer"))
    print("Is Grounded:", res_ungrounded.get("is_grounded"))


if __name__ == "__main__":
    asyncio.run(main())
