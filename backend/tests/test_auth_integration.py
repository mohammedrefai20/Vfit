def test_register_and_login_flow(client):
    register_response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "password": "testpass123"
    })
    assert register_response.status_code == 200
    assert "hashed_password" not in register_response.json()  # never leak the hash

    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "testpass123"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["has_completed_onboarding"] is False

def test_duplicate_registration_rejected(client):
    client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "pass123"})
    second = client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "pass123"})
    assert second.status_code == 400

def test_me_requires_valid_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer garbage"})
    assert response.status_code == 401