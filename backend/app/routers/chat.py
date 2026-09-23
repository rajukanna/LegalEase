"""Grounded conversational Q&A endpoint with citations and refusal guardrails."""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.auth import UserResponse
from app.models.chat import ChatRequest, ChatResponse, ChatCitation
from app.services.document_store import document_store
from app.services.vector_store import vector_store
from app.services.llm_service import get_llm_client
from app.prompts.grounded_chat import GROUNDED_CHAT_SYSTEM_PROMPT, format_grounded_chat_prompt
from app.utils.security import get_current_user

router = APIRouter(prefix="/chat", tags=["Grounded Chat"])


@router.post("", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Executes a grounded RAG query against the uploaded document.

    If the question is ungrounded or out-of-scope, explicitly responds with refusal.
    All answers include source citations to clauses and page numbers.
    """
    # Verify ownership
    doc = document_store.get_document(request.document_id, current_user.id)

    # Vector search for top-k chunks
    citations, is_grounded = vector_store.search(
        doc_id=request.document_id,
        query=request.question,
        top_k=4
    )

    # Strict Grounding Check: If no chunks retrieved above relevance threshold, refuse
    if not is_grounded or not citations:
        return ChatResponse(
            document_id=request.document_id,
            question=request.question,
            answer="I couldn't find that in this document. Please review the full agreement or consult a licensed attorney.",
            is_grounded=False,
            citations=[],
            confidence_score=0.0,
            suggested_follow_ups=[
                "What are the payment deadlines?",
                "What rights does the other party retain?",
                "What are the early termination conditions?"
            ]
        )

    # Prompt LLM with retrieved context
    llm = get_llm_client()
    user_prompt = format_grounded_chat_prompt(request.question, citations)
    llm_output = await llm.generate_json(GROUNDED_CHAT_SYSTEM_PROMPT, user_prompt)

    answer_text = llm_output.get("answer", "I couldn't find that in this document.")
    follow_ups = llm_output.get("suggested_follow_ups", [])

    return ChatResponse(
        document_id=request.document_id,
        question=request.question,
        answer=answer_text,
        is_grounded=llm_output.get("is_grounded", True),
        citations=citations,
        confidence_score=0.92,
        suggested_follow_ups=follow_ups
    )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Streams the grounded chat completion via Server-Sent Events (SSE)."""
    doc = document_store.get_document(request.document_id, current_user.id)
    citations, is_grounded = vector_store.search(doc_id=request.document_id, query=request.question, top_k=4)

    async def event_generator():
        if not is_grounded or not citations:
            refusal_data = {
                "token": "I couldn't find that in this document. Please review the full agreement or consult a licensed attorney.",
                "is_grounded": False,
                "citations": []
            }
            yield f"data: {json.dumps(refusal_data)}\n\n"
            yield "data: [DONE]\n\n"
            return

        llm = get_llm_client()
        user_prompt = format_grounded_chat_prompt(request.question, citations)
        prompt_with_citations = {
            "citations": [c.dict() for c in citations]
        }
        # Yield metadata first
        yield f"data: {json.dumps({'metadata': prompt_with_citations})}\n\n"

        async for chunk in llm.stream_text(GROUNDED_CHAT_SYSTEM_PROMPT, user_prompt):
            yield f"data: {json.dumps({'token': chunk})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
