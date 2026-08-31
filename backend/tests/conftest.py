import os
import sys
from pathlib import Path

os.environ.setdefault("ENV", "test")
os.environ.setdefault("TESTING", "true")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("CREDENTIALS_ENCRYPTION_KEY", "test-encryption-key-not-for-prod")
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "0")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 register all models
from app.core.db import Base, get_db
from app.main import app


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def _get_db_override():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db_override
    from fastapi.testclient import TestClient

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def registered_user(client):
    payload = {
        "email": "founder@example.com",
        "password": "SuperSecret123",
        "full_name": "Founder",
        "organization_name": "Acme Store",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    return data


@pytest.fixture()
def auth_headers(registered_user):
    token = registered_user["access_token"]
    org_id = registered_user["organization_id"]
    return {"Authorization": f"Bearer {token}", "X-Organization-Id": org_id}
