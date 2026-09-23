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
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https:; "
        "frame-ancestors 'none';"
    )
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


# Static Frontend Hosting (Single-Container Cloud Run Deployment)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if not os.path.exists(_frontend_dist):
    _alt = "/app/frontend/dist"
    if os.path.exists(_alt):
        _frontend_dist = _alt

if os.path.exists(_frontend_dist):
    _assets = os.path.join(_frontend_dist, "assets")
    if os.path.exists(_assets):
        app.mount("/assets", StaticFiles(directory=_assets), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path in ("openapi.json", "health"):
            return JSONResponse({"detail": "Not found"}, status_code=404)
        target = os.path.join(_frontend_dist, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(_frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"detail": "Frontend not found"}, status_code=404)

