from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    advertisements,
    alerts,
    auth,
    competitors,
    integrations,
    mining,
    monitoring,
    opportunities,
    products,
    profitability,
    suppliers,
)
from app.core.config import settings
from app.core.rate_limit import RateLimitMiddleware
from app.core.responses import register_exception_handlers


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware)

    register_exception_handlers(app)

    prefix = settings.API_V1_PREFIX
    app.include_router(auth.router, prefix=prefix)
    app.include_router(integrations.router, prefix=prefix)
    app.include_router(products.router, prefix=prefix)
    app.include_router(competitors.router, prefix=prefix)
    app.include_router(suppliers.router, prefix=prefix)
    app.include_router(profitability.router, prefix=prefix)
    app.include_router(mining.router, prefix=prefix)
    app.include_router(opportunities.router, prefix=prefix)
    app.include_router(monitoring.router, prefix=prefix)
    app.include_router(alerts.router, prefix=prefix)
    app.include_router(advertisements.router, prefix=prefix)

    @app.get("/health")
    def health():
        return {"success": True, "data": {"status": "ok"}, "meta": None}

    return app


app = create_app()
