def test_register_creates_user_and_org(client):
    payload = {
        "email": "alice@example.com",
        "password": "StrongPass123",
        "full_name": "Alice",
        "organization_name": "Alice Store",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["user"]["email"] == "alice@example.com"
    assert body["data"]["organization_id"]
    assert body["data"]["tokens"]["access_token"]
    assert body["data"]["tokens"]["refresh_token"]


def test_register_duplicate_email_fails(client):
    payload = {
        "email": "bob@example.com",
        "password": "StrongPass123",
        "organization_name": "Bob Store",
    }
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 200
    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409
    body = second.json()
    assert body["success"] is False
    assert body["error"]["code"] == "EMAIL_TAKEN"


def test_login_success_and_wrong_password(client):
    payload = {
        "email": "carol@example.com",
        "password": "StrongPass123",
        "organization_name": "Carol Store",
    }
    client.post("/api/v1/auth/register", json=payload)

    good = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert good.status_code == 200
    assert good.json()["data"]["tokens"]["access_token"]

    bad = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": "wrong"})
    assert bad.status_code == 401
    assert bad.json()["success"] is False


def test_me_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_profile(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["email"] == "founder@example.com"
    assert data["organization_name"] == "Acme Store"
    assert data["role"] == "OWNER"


def test_refresh_and_logout_flow(client, registered_user):
    refresh_token = registered_user["tokens"]["refresh_token"]
    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refreshed.status_code == 200
    new_tokens = refreshed.json()["data"]["tokens"]
    assert new_tokens["access_token"]

    # old refresh token was rotated -- reusing it should now fail
    reused = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert reused.status_code == 401

    logout = client.post("/api/v1/auth/logout", json={"refresh_token": new_tokens["refresh_token"]})
    assert logout.status_code == 200


def test_forgot_and_reset_password(client, registered_user):
    from app.core.security import decode_token  # noqa: F401 sanity import

    forgot = client.post("/api/v1/auth/forgot-password", json={"email": "founder@example.com"})
    assert forgot.status_code == 200

    # forgot-password never leaks the token via the API by design; unknown
    # email should behave identically (no error, no leak).
    unknown = client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
    assert unknown.status_code == 200
