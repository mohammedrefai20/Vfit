# V Fit — System Architecture

Status: Locked for MVP
Depends on: docs/PRD.md

---

## 1. Overview

V Fit is a single deployable FastAPI backend (monorepo, Clean Architecture internally — not microservices) plus a Next.js frontend. All AI-generated output (chat replies, workout plans) passes through a fixed pipeline that separates deterministic, auditable steps from the two generative (LLM) steps. This separation is what makes the "never invent exercises" guarantee enforceable and testable.

## 2. The Pipeline

Every user message (chat or plan generation) flows through the same nine-stage pipeline:

1. **User message** — raw input, any language
2. **Detect language** — identify Arabic vs English (or others)
3. **Translate to English** — no-op if already English
4. **Validate input** — deterministic checks (empty input, malformed profile data, rate limits)
5. **Retrieve candidates** — pull relevant exercises (Postgres) and/or knowledge chunks (Qdrant), depending on request type
6. **Rule engine** — deterministic filtering/guardrails (equipment, experience, injury exclusions, database membership)
7. **LLM planning** — generative step; produces a draft plan or chat reply from the rule-engine-filtered candidates only
8. **Validate output** — deterministic check that every referenced exercise resolves to a real database `id`; reject and regenerate if not
9. **Translate and respond** — translate back to user's language if needed, return final response

Only stages 7 (LLM planning) is generative. Everything else is deterministic and unit-testable without any LLM call.

### Pipeline contract

```python
class PipelineContext:
    raw_message: str
    detected_language: str
    english_message: str
    user_profile: UserProfile | None
    candidate_exercises: list[Exercise]
    rule_engine_output: RuleEngineResult
    llm_output: RawPlan | ChatReply
    validated_output: ValidatedPlan | ValidatedReply
    final_response: str
```

Each stage is a discrete function/class consuming and enriching this context. This makes every stage independently testable — critical for the rule engine and validator, which need high test confidence (see PRD Section 5).

## 3. Service Boundaries (Clean Architecture layers)

```
app/
  api/            FastAPI routers — request/response only, no business logic
  services/       Use-case orchestration (WorkoutPlannerService, ChatService)
  domain/         Pure Python: RuleEngine, Validator, entities — zero framework/DB deps
  repositories/   Postgres + Qdrant access, hidden behind interfaces
  providers/      LLM abstraction, translation abstraction
  core/           Config, logging, DI wiring, provider factory
```

Rule: `services` never imports SQLAlchemy or a provider SDK directly — only interfaces from `repositories`/`providers`. `domain` never imports FastAPI, SQLAlchemy, or any provider SDK — it's the part of the codebase that gets tested with zero mocks of external systems.

## 4. LLM Provider Abstraction

```python
class LLMProvider(Protocol):
    def generate(self, messages: list[Message], system_prompt: str,
                 response_format: ResponseFormat) -> LLMResponse: ...
```

- `GrokProvider` — concrete implementation, built first
- `OpenAIProvider`, `GeminiProvider` — stubbed, added later without touching `services`
- Selected via `LLM_PROVIDER` env var, instantiated once through a factory in `app/core`
- `LLMResponse` is normalized — provider-specific parsing (function-calling format, response structure) stays fully inside each provider class. No provider-specific detail ever reaches `services`.

## 5. Translation

Reuses `LLMProvider` — no separate translation API/vendor for MVP. A small, strict translation prompt (`translate(text, source_lang, target_lang) -> str`) is implemented as a thin wrapper in `providers/translation.py`, calling the same Grok instance. Kept behind its own interface so a dedicated translation API can be swapped in later without touching callers.

## 6. RAG vs Direct-LLM Routing (Chat)

Two-tier decision, cheapest-first:

1. **Heuristic pre-filter** (no API call): message length, presence of scientific/exercise keywords ("hypertrophy," "why does," "how does," "explain") → knowledge-heavy; short greetings/small talk ("hi," "thanks," "ok") → conversational.
2. **LLM fallback classification**: only when the heuristic is inconclusive, one cheap classification call via the same `LLMProvider`.

This keeps routing free of any new service and minimizes LLM calls — deliberately cost-conscious, worth calling out in documentation/interviews as a design decision, not an accident.

## 7. Data Ownership: Postgres vs Qdrant

| Store | Owns | Never contains |
|---|---|---|
| **Postgres** | users, profiles, exercises (structured fields), workouts, workout_versions, progress_logs, chat_sessions | Book text/embeddings |
| **Qdrant** | Embedded chunks from the 7 reference books only. Payload per chunk: `book_title`, `page_number`, `chunk_text` | Exercise data |

Exercise retrieval for the workout planner is **structured SQL/filter queries against Postgres** — not vector search. Qdrant is exclusively the RAG knowledge base for the chat assistant's knowledge-heavy answers. This boundary must not blur: exercises never get embedded into Qdrant "for convenience," because that would break the deterministic-retrieval guarantee the rule engine depends on.

## 8. Injury-Handling State Machine

```
plan_change_proposed  →  (user confirms)  →  plan_change_applied
                       →  (user rejects)   →  plan_change_cancelled
```

`plan_change_proposed` carries the list of affected exercises and proposed replacements. This state lives in the chat session's short-term memory (same store as the 24h chat memory), scoped to that conversation — it is not a separate persistent table for MVP.

## 9. Free-Tier Hosting Fit (sanity check — finalized in Phase 14)

| Component | Target | Notes |
|---|---|---|
| Backend (FastAPI) | Render or Fly.io free tier | Single service, low compute needs for MVP traffic |
| Postgres | Neon or Supabase free tier | Small dataset: exercises, users, logs — well within free storage limits |
| Qdrant | Self-hosted via Docker on same host as backend, or Qdrant Cloud free tier | 7 books' worth of chunks is a small collection (low thousands of vectors) |
| Frontend (Next.js) | Vercel free tier | Standard fit |
| LLM | Grok API | Pay-as-you-go; no free-tier constraint to design around, but keep prompt sizes reasonable to control cost |

Expected data volume (7 books of embeddings + a curated exercise DB + a small user base) comfortably fits within free-tier storage/compute across all providers above.

## 10. Explicit Non-Goals (Architecture)

- No microservices — one deployable backend, boundaries enforced in code, not over the network
- No message queue/async job system for MVP — all pipeline stages run synchronously within the request
- No separate translation vendor — reuses the LLM provider abstraction
