"""Generic org-scoped repository base class.

Every repository that manages tenant data should subclass this so org
isolation is enforced in one place rather than repeated (and possibly
forgotten) in every service/endpoint.
"""
from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


class OrgScopedRepository(Generic[ModelT]):
    model: Type[ModelT]

    def __init__(self, db: Session):
        self.db = db

    def get(self, organization_id: str, id_: str) -> Optional[ModelT]:
        stmt = select(self.model).where(self.model.id == id_, self.model.organization_id == organization_id)
        return self.db.execute(stmt).scalars().first()

    def list(self, organization_id: str, **filters) -> Sequence[ModelT]:
        stmt = select(self.model).where(self.model.organization_id == organization_id)
        for key, value in filters.items():
            if value is not None:
                stmt = stmt.where(getattr(self.model, key) == value)
        return self.db.execute(stmt).scalars().all()

    def create(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelT, **changes) -> ModelT:
        for key, value in changes.items():
            if value is not None:
                setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.commit()
