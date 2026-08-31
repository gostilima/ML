"""Celery task stubs for background marketplace data sync/scoring.

Each task is a thin wrapper: it opens a DB session, resolves org
credentials, and delegates to the relevant service. Full sync logic
(pagination, incremental cursors, retries/backoff) is a Priority-2 TODO --
these stubs establish the wiring/contract so the scheduler and API layers
have something real to call.
"""
import logging

from app.core.db import SessionLocal
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="workers.sync_products")
def sync_products(organization_id: str) -> dict:
    logger.info("sync_products started org=%s", organization_id)
    # TODO: pull catalog via CatalogService using the org's stored access token
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.sync_prices")
def sync_prices(organization_id: str) -> dict:
    logger.info("sync_prices started org=%s", organization_id)
    # TODO: pull prices via PricingService and record listing_prices rows
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.sync_orders")
def sync_orders(organization_id: str) -> dict:
    logger.info("sync_orders started org=%s", organization_id)
    # TODO: pull orders via OrdersService and feed sales_history
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.sync_listings")
def sync_listings(organization_id: str) -> dict:
    logger.info("sync_listings started org=%s", organization_id)
    # TODO: pull listings via ListingsService, upsert listings/listing_history
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.sync_competitors")
def sync_competitors(organization_id: str, product_id: str, query: str = "") -> dict:
    logger.info("sync_competitors started org=%s product=%s", organization_id, product_id)
    # Delegates to CompetitorService.sync (async) -- run via asyncio.run
    # since Celery tasks are sync by default.
    import asyncio

    from app.services.competitor_service import CompetitorService

    db = SessionLocal()
    try:
        service = CompetitorService(db)
        results = asyncio.run(service.sync(organization_id, product_id, query))
        return {"organization_id": organization_id, "product_id": product_id, "count": len(results)}
    finally:
        db.close()


@celery_app.task(name="workers.calculate_sales_estimates")
def calculate_sales_estimates(organization_id: str) -> dict:
    logger.info("calculate_sales_estimates started org=%s", organization_id)
    # TODO: derive sales_estimates/revenue_estimates from sales_history
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.calculate_opportunities")
def calculate_opportunities(organization_id: str) -> dict:
    logger.info("calculate_opportunities started org=%s", organization_id)
    # TODO: run OpportunityScoreService over mined keywords/products
    return {"organization_id": organization_id, "status": "queued"}


@celery_app.task(name="workers.update_marketplace_data")
def update_marketplace_data(organization_id: str) -> dict:
    logger.info("update_marketplace_data started org=%s", organization_id)
    # Orchestrates sync_products/prices/orders/listings for the org.
    sync_products.delay(organization_id)
    sync_prices.delay(organization_id)
    sync_orders.delay(organization_id)
    sync_listings.delay(organization_id)
    return {"organization_id": organization_id, "status": "dispatched"}


@celery_app.task(name="workers.generate_reports")
def generate_reports(organization_id: str) -> dict:
    logger.info("generate_reports started org=%s", organization_id)
    # TODO: aggregate profitability/opportunity data into a report artifact
    return {"organization_id": organization_id, "status": "queued"}
