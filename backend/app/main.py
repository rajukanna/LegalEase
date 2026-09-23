"""FastAPI main application entrypoint with security middleware and routers."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routers import auth, documents, analyze, compare, chat, export
from app.services.seed_data import seed_sample_documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook: seed initial public legal documents on startup."""
    seed_sample_documents()
    yield


from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GenAI-powered legal document understanding, comparison, and grounded Q&A platform.",
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Applies defensive security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response


# Mount API V1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(analyze.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)

# Also mount at top-level for convenience
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(analyze.router)
app.include_router(compare.router)
app.include_router(chat.router)
app.include_router(export.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker, Cloud Run, and load balancers."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER
    }
