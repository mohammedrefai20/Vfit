# V Fit — Product Requirements Document (PRD)

Status: Locked for MVP
Owner: You (Solo build)
Purpose of this doc: single source of truth for scope. Any feature not listed here as "In Scope" does not get built until MVP ships.

---

## 1. Product Summary

V Fit is an AI-powered fitness platform combining a rule-driven exercise engine, a curated exercise database, and a hybrid RAG/LLM assistant to generate safe, personalized workout plans and answer fitness questions. Target v1: responsive web app, free-tier hosted, portfolio/CV-quality build demonstrating production engineering practices (Clean Architecture, testing, documentation, deployment).

Non-goals for v1: nutrition planning, payments/subscriptions, native mobile app, body photo uploads.

---

## 2. User Types & Journeys

### 2.1 Visitor
- No authentication required.
- Can use the AI Fitness Assistant (chat) freely.
- No persistent storage — refreshing the page resets the session.
- Cannot generate a workout plan (requires a profile).

**Journey:** Land on site → open floating chat → ask fitness questions → (optionally) prompted to sign up to get a personalized plan.

### 2.2 Registered User
- Email/password authentication.
- Completes onboarding wizard after signup (not during signup).
- Can generate and regenerate workout plans.
- Weekly progress check-ins.
- Chat history persists for 24 hours.
- Workout plan history: latest 3 versions kept.

**Journey:** Sign up → onboarding wizard (age, sex, height, weight, goal, experience, gym/home, equipment, training days) → generate workout plan → use chat with memory → weekly progress prompts → view/adjust plan over time.

---

## 3. MVP Scope

### 3.1 In Scope
| Feature | Notes |
|---|---|
| Authentication | Email/password only. No OAuth in v1. |
| Onboarding Wizard | Post-registration, multi-step, not a single long form. |
| AI Chat Assistant | Hybrid: direct LLM for simple/conversational queries, RAG for knowledge-heavy questions. Available to both Visitor and Registered. |
| Workout Planner | Rule engine + exercise DB retrieval + LLM planning + validator. Never invents exercises. |
| Exercise Database | Manually curated, extracted from reference books, structured schema (see Section 6). |
| Progress Tracking | Weekly weight + optional note. No photos. |
| Workout Versioning | Latest 3 plan versions retained per user. |
| Multi-language | English internal/database; Arabic supported via translation wrapper. |
| LLM Provider Abstraction | Not locked to one vendor (Grok/Gemini/OpenAI interchangeable). |

### 3.2 Explicitly Out of Scope (v1)
- Nutrition tracking/planning
- Payments or subscription tiers
- Native mobile app (web-responsive only; mobile app is a stated future phase)
- Body photo uploads
- Social features (sharing, following, leaderboards)
- OAuth/social login

These are documented so they can be picked up post-MVP without re-debating scope.

---

## 4. User Stories

### 4.1 Onboarding
- As a new registered user, I want a guided multi-step wizard after signup, so I'm not overwhelmed by one long form.
- As a new registered user, I want to specify my goal, experience level, and equipment access, so my workout plan fits my real situation.
- As a returning user, I want to edit my profile info later, so my plan can adapt as my circumstances change.
- As a user with limited equipment, I want the wizard to ask about gym vs. home training, so exercises match what I can actually do.

### 4.2 AI Chat Assistant
- As a visitor, I want to ask fitness questions without signing up, so I can evaluate the platform before committing.
- As any user, I want quick, direct answers to greetings/simple questions, so the assistant doesn't feel slow or over-engineered.
- As any user, I want scientifically grounded answers to knowledge-heavy questions (e.g., hypertrophy mechanisms), so I trust the advice.
- As a registered user, I want my conversation remembered for 24 hours, so I don't have to repeat context in a follow-up session same-day.

### 4.3 Workout Planner
- As a registered user, I want a workout plan generated from my profile and the exercise database, so every exercise is safe and appropriate.
- As a registered user, I want to request a replacement for a specific exercise, so I can adapt around access/preference issues, with a brief explanation of why the substitute was chosen.
- As a registered user who reports an injury, I want the system to ask for confirmation before removing affected exercises, so I stay in control of my plan.
- As a registered user, I want to understand briefly why my plan looks the way it does, so I trust the reasoning isn't arbitrary.
- As a registered user, I want access to my last 3 plan versions, so I can compare progress or revert.

### 4.4 Progress Tracking
- As a registered user, I want to be asked for my current weight every 7 days, so tracking is consistent without manual effort.
- As a registered user, I want to add an optional note with my weekly check-in, so I can log context (e.g., "felt strong this week").
- As a registered user, I want to see my progress history over time, so I can evaluate whether the plan is working.

---

## 5. Acceptance Criteria — Highest-Risk Features

### 5.1 Rule Engine — Zero Hallucinated Exercises
- **Given** any workout plan output (initial generation or regeneration), **then** 100% of exercises referenced must resolve to a valid `id` in the exercise database. Zero tolerance for invented/hallucinated exercises.
- **Given** the LLM planning step, **then** it may only select from a candidate list pre-filtered by the rule engine — it cannot free-generate exercise names.
- **Given** a validator step post-LLM, **then** any plan containing an unresolvable exercise reference is rejected and regenerated, not shown to the user.

### 5.2 Injury Handling
- **Given** a user reports an injury (e.g., "my shoulder hurts"), **then** the system must identify which currently-planned exercises are affected and present them explicitly.
- **Given** that list is presented, **then** the system must wait for explicit user confirmation before removing/replacing any exercise.
- **Given** confirmation is received, **then** the system explains briefly why each replacement was chosen (e.g., "swapped overhead press for chest press — lower shoulder strain, same primary muscle group").

---

## 6. Exercise Database Schema (Reference)

Each exercise record includes: Name, Primary muscles, Secondary muscles, Equipment, Difficulty, Compound/Isolation, Instructions, Contraindications, Alternatives, YouTube URL.

Source: manually extracted and reviewed from 7 reference books (see Knowledge Base list in master prompt) before import — no automated/unreviewed bulk import.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Chat latency | Streaming response should begin within ~2 seconds of user message |
| Chat memory | 24-hour retention window, then discarded |
| Progress data | Retained indefinitely (no auto-deletion) |
| Workout versions | Only latest 3 retained; older versions purged |
| Hosting | Must operate within free-tier limits of chosen providers (backend, DB, vector store, frontend hosting) — validated during Phase 1 architecture design |
| Internal language | English (DB + knowledge base + LLM reasoning); Arabic supported via translation wrapper at the edges |
| Data privacy | No body photo uploads; no sensitive health data beyond what's needed for training (age, sex, height, weight, injuries reported in chat) |

---

## 8. Definition of Done (MVP)

V Fit v1 is considered demo/CV-ready when:
- [ ] A visitor can chat with the AI assistant with no signup, and RAG-backed answers cite/ground correctly to the knowledge base
- [ ] A user can register, complete onboarding, and receive a valid workout plan containing only database exercises
- [ ] Exercise replacement and injury-confirmation flows work end-to-end
- [ ] Weekly progress check-in prompts fire and store data correctly
- [ ] Latest-3 workout versioning works and old versions are purged
- [ ] Arabic input produces correct Arabic output via the translation wrapper
- [ ] App is deployed and publicly accessible on free-tier infrastructure
- [ ] README + architecture docs are complete enough for a reviewer (recruiter/engineer) to understand the system without asking you questions
- [ ] Core rule engine and validator logic have unit test coverage

---

## 9. Open Assumptions (confirmed with stakeholder)

- No payments/subscription system in v1 — confirmed.
- Web-only target for v1; mobile app deferred — confirmed.
- Portfolio/CV quality bar applies to engineering practices (tests, docs, architecture, deployment), not just feature completeness — confirmed.
