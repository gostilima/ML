"""Standard API response envelope + FastAPI exception handlers."""
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def success_envelope(data: Any = None, meta: Optional[dict] = None) -> dict:
    return {"success": True, "data": jsonable_encoder(data), "meta": meta}


def error_envelope(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}


class AppError(HTTPException):
    """Raise for domain errors that should map to the standard error envelope."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})
        self.code = code
        self.message = message


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=error_envelope(exc.code, exc.message))

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        detail = exc.detail
        if isinstance(detail, dict) and "code" in detail and "message" in detail:
            code, message = detail["code"], detail["message"]
        else:
            code = _code_for_status(exc.status_code)
            message = detail if isinstance(detail, str) else str(detail)
        return JSONResponse(status_code=exc.status_code, content=error_envelope(code, message))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_envelope("VALIDATION_ERROR", jsonable_encoder(exc.errors())),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_envelope("INTERNAL_ERROR", "An unexpected error occurred."),
        )


def _code_for_status(status_code: int) -> str:
    return {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMITED",
    }.get(status_code, "ERROR")
