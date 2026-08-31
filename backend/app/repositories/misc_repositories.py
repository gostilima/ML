"""Thin org-scoped repositories for the priority-2 domains."""
from app.models.advertisement import Advertisement, AdvertisementVersion
from app.models.alert import Alert
from app.models.competitor import Competitor
from app.models.fees import Fee, LogisticsRate
from app.models.monitoring import MonitoredProduct
from app.models.opportunity import Opportunity
from app.repositories.base import OrgScopedRepository


class OpportunityRepository(OrgScopedRepository[Opportunity]):
    model = Opportunity


class CompetitorRepository(OrgScopedRepository[Competitor]):
    model = Competitor


class MonitoredProductRepository(OrgScopedRepository[MonitoredProduct]):
    model = MonitoredProduct


class AlertRepository(OrgScopedRepository[Alert]):
    model = Alert


class AdvertisementRepository(OrgScopedRepository[Advertisement]):
    model = Advertisement


class FeeRepository:
    def __init__(self, db):
        self.db = db

    def find_best_match(self, organization_id, marketplace: str, category: str | None):
        from sqlalchemy import select

        stmt = select(Fee).where(Fee.marketplace == marketplace)
        rows = self.db.execute(stmt).scalars().all()
        # Prefer: org-specific + category match > org-specific generic
        # > global + category match > global generic
        candidates = [
            r
            for r in rows
            if (r.organization_id == organization_id or r.organization_id is None)
        ]
        if not candidates:
            return None

        def score(r: Fee) -> tuple:
            return (
                1 if r.organization_id == organization_id else 0,
                1 if (category and r.category == category) else 0,
            )

        candidates.sort(key=score, reverse=True)
        return candidates[0]


class LogisticsRateRepository:
    def __init__(self, db):
        self.db = db

    def list_for(self, organization_id, marketplace: str, logistics_type=None):
        from sqlalchemy import select

        stmt = select(LogisticsRate).where(LogisticsRate.marketplace == marketplace)
        if logistics_type is not None:
            stmt = stmt.where(LogisticsRate.logistics_type == logistics_type)
        rows = self.db.execute(stmt).scalars().all()
        return [r for r in rows if (r.organization_id == organization_id or r.organization_id is None)]
