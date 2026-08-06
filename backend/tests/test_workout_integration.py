from app.core.di import get_groq_provider
from app.main import app
from tests.fakes import FakeLLMProvider, make_fake_plan_response

def _register_and_login(client, email="planner@example.com"):
    client.post("/api/v1/auth/register", json={"email": email, "password": "pass123"})
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "pass123"})
    return login.json()["access_token"]

def _create_exercise(db_session):
    from app.models.exercise import Exercise
    exercise = Exercise(
        name="Test Squat", primary_muscles="Legs", secondary_muscles="",
        equipment="Bodyweight", difficulty="Beginner", movement_type="Compound",
        instructions="...", contraindications=None, youtube_url="",
    )
    db_session.add(exercise)
    db_session.commit()
    db_session.refresh(exercise)
    return exercise

def test_generate_workout_only_uses_eligible_exercises(client, db_session):
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    exercise = _create_exercise(db_session)

    # client.post("/api/v1/profile", headers=headers, json={
    #     "age": 25, "sex": "Male", "height": 175, "weight": 70,
    #     "goal": "General", "experience": "Beginner", "training_location": "Home",
    #     "equipment": "Bodyweight", "training_days": 1,
    # })
    profile_response = client.post(
        "/api/v1/profile",
        headers=headers,
        json={
            "age": 25,
            "sex": "Male",
            "height": 175,
            "weight": 70,
            "goal": "General",
            "experience": "Beginner",
            "training_location": "Home",
            "equipment": "Bodyweight",
            "training_days": 1,
        },
    )
    fake_llm = FakeLLMProvider(make_fake_plan_response(str(exercise.id), exercise.name))
    app.dependency_overrides[get_groq_provider] = lambda: fake_llm

    response = client.post("/api/v1/workouts/generate", headers=headers)
    print("=" * 80)
    print("STATUS :", response.status_code)
    print("BODY   :", response.text)
    print("=" * 80)
    assert response.status_code == 200
    assert response.json()["version"] == 1

    app.dependency_overrides.pop(get_groq_provider, None)

def test_generate_workout_rejects_hallucinated_exercise(client, db_session):
    token = _register_and_login(client, email="hallucinate@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    _create_exercise(db_session)

    client.post("/api/v1/profile", headers=headers, json={
        "age": 25, "sex": "Male", "height": 175, "weight": 70,
        "goal": "General", "experience": "Beginner", "training_location": "Home",
        "equipment": "Bodyweight", "training_days": 1,
    })

    fake_llm = FakeLLMProvider(make_fake_plan_response("fake-nonexistent-id", "Made Up Exercise"))
    app.dependency_overrides[get_groq_provider] = lambda: fake_llm

    response = client.post("/api/v1/workouts/generate", headers=headers)
    assert response.status_code == 502  # validator correctly rejected it

    app.dependency_overrides.pop(get_groq_provider, None)


def test_progress_log_and_due_check(client, db_session):
    token = _register_and_login(client, email="progress@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    due_before = client.get("/api/v1/progress/due", headers=headers)
    assert due_before.json()["due"] is True  # never logged yet

    log_response = client.post("/api/v1/progress", headers=headers, json={"weight": 75.0, "note": "test"})
    assert log_response.status_code == 200

    due_after = client.get("/api/v1/progress/due", headers=headers)
    assert due_after.json()["due"] is False  # just logged