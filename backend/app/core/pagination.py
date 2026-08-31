"""Shared pagination helpers for list endpoints."""
from typing import Generic, List, Sequence, TypeVar

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: List[T]
    page: int
    limit: int
    total: int


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def paginate_query(db: Session, stmt, params: PaginationParams) -> tuple[Sequence, int]:
    """Run `stmt` (a select()) with limit/offset and also return the total count."""
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.execute(stmt.offset(params.offset).limit(params.limit)).scalars().all()
    return items, total


def paginate_list(items: Sequence, params: PaginationParams) -> Page:
    total = len(items)
    start = params.offset
    end = start + params.limit
    return Page(items=list(items[start:end]), page=params.page, limit=params.limit, total=total)
