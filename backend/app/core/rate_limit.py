"""Simple in-memory per-IP token-bucket rate limiting middleware.

For multi-process deployments, back this with Redis instead; the in-memory
implementation is adequate for a single-worker/dev deployment and for tests.
"""
import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.responses import error_envelope


class _Bucket:
    __slots__ = ("tokens", "last_refill")

    def __init__(self, tokens: float, last_refill: float):
        self.tokens = tokens
        self.last_refill = last_refill


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int | None = None):
        super().__init__(app)
        self.capacity = requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self.refill_rate = self.capacity / 60.0  # tokens per second
        self._buckets: dict[str, _Bucket] = defaultdict(lambda: _Bucket(self.capacity, time.monotonic()))
        self._lock = Lock()

    async def dispatch(self, request: Request, call_next):
        if settings.TESTING or self.capacity <= 0:
            return await call_next(request)

        client_key = request.headers.get("authorization") or (request.client.host if request.client else "anonymous")
        now = time.monotonic()
        with self._lock:
            bucket = self._buckets[client_key]
            elapsed = now - bucket.last_refill
            bucket.tokens = min(self.capacity, bucket.tokens + elapsed * self.refill_rate)
            bucket.last_refill = now
            if bucket.tokens < 1:
                allowed = False
            else:
                bucket.tokens -= 1
                allowed = True

        if not allowed:
            return JSONResponse(
                status_code=429,
                content=error_envelope("RATE_LIMITED", "Too many requests. Please try again later."),
            )
        return await call_next(request)
