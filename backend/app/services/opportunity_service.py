from sqlalchemy.orm import Session

from app.calculations.opportunity_score import OpportunityScores, calculate_opportunity_score
from app.models.opportunity import Opportunity
from app.repositories.misc_repositories import OpportunityRepository
from app.schemas.opportunity import OpportunitySearchFilter


class OpportunityScoreService:
    def __init__(self, db: Session):
        self.repo = OpportunityRepository(db)

    def list(self, organization_id: str):
        return self.repo.list(organization_id)

    def search(self, organization_id: str, filters: OpportunitySearchFilter):
        items = list(self.repo.list(organization_id, category=filters.category))
        if filters.keyword:
            items = [i for i in items if i.keyword and filters.keyword.lower() in i.keyword.lower()]
        if filters.min_score is not None:
            items = [i for i in items if i.total_score >= filters.min_score]
        start = (filters.page - 1) * filters.limit
        end = start + filters.limit
        return items[start:end], len(items)

    def score_and_save(
        self,
        organization_id: str,
        *,
        product_id: str | None,
        keyword: str | None,
        category: str | None,
        scores: OpportunityScores,
    ) -> Opportunity:
        total = calculate_opportunity_score(scores)
        opportunity = Opportunity(
            organization_id=organization_id,
            product_id=product_id,
            keyword=keyword,
            category=category,
            demand_score=scores.demand,
            consistency_score=scores.consistency,
            margin_score=scores.margin,
            competition_score=scores.competition,
            growth_score=scores.growth,
            logistics_score=scores.logistics,
            repurchase_score=scores.repurchase,
            total_score=total,
        )
        return self.repo.create(opportunity)
