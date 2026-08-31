"""Integration tests for the Mercado Livre API-credential + OAuth flow --
the core feature of this service. httpx calls to Mercado Livre are mocked;
we verify masking, encryption at rest, and status transitions."""
import pytest

from app.core.security import decrypt_value
from app.integrations.mercado_livre.client import MercadoLivreOAuthClient, TokenResponse
from app.models.api_credential import ApiCredential, CredentialStatus


def test_save_get_and_mask_credentials(client, auth_headers):
    payload = {"client_id": "1234567890123456", "client_secret": "super-secret-value"}
    create = client.post("/api/v1/integrations/mercado-livre/credentials", json=payload, headers=auth_headers)
    assert create.status_code == 200, create.text
    data = create.json()["data"]
    assert data["status"] == "DISCONNECTED"
    # only last 4 chars of client_id are visible; secret itself never appears
    assert data["client_id_masked"].endswith("3456")
    assert "super-secret-value" not in create.text
    assert "client_secret" not in data

    fetched = client.get("/api/v1/integrations/mercado-livre/credentials", headers=auth_headers)
    assert fetched.status_code == 200
    assert fetched.json()["data"]["client_id_masked"] == data["client_id_masked"]


def test_get_credentials_404_when_none_saved(client, auth_headers):
    response = client.get("/api/v1/integrations/mercado-livre/credentials", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["success"] is False


def test_authorize_url_requires_saved_credentials_first(client, auth_headers):
    response = client.get("/api/v1/integrations/mercado-livre/oauth/authorize-url", headers=auth_headers)
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "CREDENTIALS_NOT_CONFIGURED"


def test_authorize_url_builds_expected_shape(client, auth_headers):
    client.post(
        "/api/v1/integrations/mercado-livre/credentials",
        json={"client_id": "myclientid123", "client_secret": "myclientsecret"},
        headers=auth_headers,
    )
    response = client.get("/api/v1/integrations/mercado-livre/oauth/authorize-url", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["authorize_url"].startswith("https://auth.mercadolibre.com.br/authorization?")
    assert "response_type=code" in data["authorize_url"]
    assert "client_id=myclientid123" in data["authorize_url"]
    assert "state=" + data["state"] in data["authorize_url"]


def test_oauth_callback_exchanges_code_and_encrypts_tokens(client, auth_headers, db_session, monkeypatch):
    client.post(
        "/api/v1/integrations/mercado-livre/credentials",
        json={"client_id": "myclientid123", "client_secret": "myclientsecret"},
        headers=auth_headers,
    )
    authorize = client.get("/api/v1/integrations/mercado-livre/oauth/authorize-url", headers=auth_headers)
    state = authorize.json()["data"]["state"]

    async def fake_exchange(self, *, client_id, client_secret, code, redirect_uri):
        assert client_id == "myclientid123"
        assert client_secret == "myclientsecret"
        assert code == "AUTH_CODE_123"
        return TokenResponse(
            access_token="ml-access-token-xyz",
            token_type="bearer",
            expires_in=21600,
            refresh_token="ml-refresh-token-xyz",
            user_id="999888777",
        )

    monkeypatch.setattr(MercadoLivreOAuthClient, "exchange_code_for_token", fake_exchange)

    # The callback is a browser-facing redirect target (Mercado Livre sends
    # the user's browser here) -- it 302s back to the frontend's
    # /configuracoes page rather than returning JSON.
    callback = client.get(
        "/api/v1/integrations/mercado-livre/oauth/callback",
        params={"code": "AUTH_CODE_123", "state": state},
        follow_redirects=False,
    )
    assert callback.status_code in (302, 307), callback.text
    location = callback.headers["location"]
    assert location.startswith("http://localhost:3000/configuracoes?")
    assert "ml_connected=1" in location

    # Verify tokens are stored encrypted at rest, never in plaintext.
    stored = db_session.query(ApiCredential).first()
    assert stored.status == CredentialStatus.CONNECTED
    assert stored.ml_user_id == "999888777"
    assert stored.access_token != "ml-access-token-xyz"
    assert stored.refresh_token != "ml-refresh-token-xyz"
    assert decrypt_value(stored.access_token) == "ml-access-token-xyz"
    assert decrypt_value(stored.refresh_token) == "ml-refresh-token-xyz"
    # redirect never echoes raw secrets/tokens
    assert "ml-access-token-xyz" not in location
    assert "ml-refresh-token-xyz" not in location


def test_oauth_callback_invalid_state_rejected(client, auth_headers):
    client.post(
        "/api/v1/integrations/mercado-livre/credentials",
        json={"client_id": "myclientid123", "client_secret": "myclientsecret"},
        headers=auth_headers,
    )
    response = client.get(
        "/api/v1/integrations/mercado-livre/oauth/callback",
        params={"code": "x", "state": "not-a-real-state"},
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    location = response.headers["location"]
    assert location.startswith("http://localhost:3000/configuracoes?")
    assert "ml_error=" in location


def test_oauth_refresh_updates_tokens(client, auth_headers, db_session, monkeypatch):
    client.post(
        "/api/v1/integrations/mercado-livre/credentials",
        json={"client_id": "myclientid123", "client_secret": "myclientsecret"},
        headers=auth_headers,
    )
    authorize = client.get("/api/v1/integrations/mercado-livre/oauth/authorize-url", headers=auth_headers)
    state = authorize.json()["data"]["state"]

    async def fake_exchange(self, *, client_id, client_secret, code, redirect_uri):
        return TokenResponse(
            access_token="first-access-token",
            token_type="bearer",
            expires_in=21600,
            refresh_token="first-refresh-token",
            user_id="999888777",
        )

    monkeypatch.setattr(MercadoLivreOAuthClient, "exchange_code_for_token", fake_exchange)
    client.get("/api/v1/integrations/mercado-livre/oauth/callback", params={"code": "AUTH_CODE_123", "state": state})

    async def fake_refresh(self, *, client_id, client_secret, refresh_token):
        assert refresh_token == "first-refresh-token"
        return TokenResponse(
            access_token="second-access-token",
            token_type="bearer",
            expires_in=21600,
            refresh_token="second-refresh-token",
            user_id="999888777",
        )

    monkeypatch.setattr(MercadoLivreOAuthClient, "refresh_access_token", fake_refresh)

    refreshed = client.post("/api/v1/integrations/mercado-livre/oauth/refresh", headers=auth_headers)
    assert refreshed.status_code == 200, refreshed.text

    stored = db_session.query(ApiCredential).first()
    assert decrypt_value(stored.access_token) == "second-access-token"
    assert decrypt_value(stored.refresh_token) == "second-refresh-token"


def test_delete_credentials_disconnects(client, auth_headers):
    client.post(
        "/api/v1/integrations/mercado-livre/credentials",
        json={"client_id": "myclientid123", "client_secret": "myclientsecret"},
        headers=auth_headers,
    )
    delete = client.delete("/api/v1/integrations/mercado-livre/credentials", headers=auth_headers)
    assert delete.status_code == 200

    fetched = client.get("/api/v1/integrations/mercado-livre/credentials", headers=auth_headers)
    assert fetched.status_code == 404


def test_credentials_require_auth(client):
    response = client.get("/api/v1/integrations/mercado-livre/credentials")
    assert response.status_code == 401
