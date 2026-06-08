# FastAPI Backend Project Audit

Audit date: 2026-06-09  
Scope: `backend/app`, `backend/tests`, `backend/requirements.txt`, and backend environment examples.

This audit is observational only. No application code was changed.

## Executive Summary

The backend is a clean early-stage FastAPI starter with SQLAlchemy models, Pydantic schemas, JWT authentication, lead ownership, listing CRUD-lite behavior, and optional OpenAI-powered listing description generation.

The core structure is in place, but most modules are still minimum viable implementations. The largest gaps are missing migrations, limited CRUD coverage, duplicate listing routes, incomplete production auth hardening, no pagination/filtering, no update/delete/detail endpoints, limited test coverage, and no explicit authorization model for listings.

## Backend Architecture

Primary layers:

- `app/main.py`: FastAPI application creation, lifespan startup, CORS, health endpoint, router mounting.
- `app/api/v1/api.py`: Versioned API router composition.
- `app/api/v1/endpoints`: Versioned auth and lead endpoints.
- `app/routes/listings.py`: Listing routes reused both as root-level and versioned routes.
- `app/services`: Business logic for auth, leads, and listings.
- `app/models`: SQLAlchemy ORM models.
- `app/schemas`: Pydantic request/response schemas.
- `app/db`: SQLAlchemy base, engine/session, and startup table creation.
- `app/core`: Configuration and security helpers.
- `tests`: Basic health and listing service tests.

## Existing API Endpoints

| Method | Path | Auth Required | Handler | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | No | `main.health_check` | Basic service health check. |
| `GET` | `/listings` | No | `routes.listings.read_listings` | List all listings. |
| `POST` | `/listings` | No | `routes.listings.add_listing` | Create a listing. |
| `POST` | `/api/v1/auth/register` | No | `endpoints.auth.register` | Create a user and return JWT. |
| `POST` | `/api/v1/auth/login` | No | `endpoints.auth.login` | Authenticate user and return JWT. |
| `GET` | `/api/v1/auth/me` | Yes | `endpoints.auth.me` | Return the current authenticated user. |
| `GET` | `/api/v1/listings` | No | `routes.listings.read_listings` | Versioned duplicate of root listing list endpoint. |
| `POST` | `/api/v1/listings` | No | `routes.listings.add_listing` | Versioned duplicate of root listing create endpoint. |
| `GET` | `/api/v1/leads` | Yes | `endpoints.leads.read_leads` | List leads owned by current user. |
| `POST` | `/api/v1/leads` | Yes | `endpoints.leads.add_lead` | Create a lead owned by current user. |

## Existing Database Models

### `User`

Table: `users`

Fields:

- `id`: integer primary key, indexed.
- `email`: unique indexed string, max 255.
- `name`: string, max 255.
- `hashed_password`: string, max 255.
- `is_active`: boolean, default `True`.
- `created_at`: timezone-aware database timestamp, default `now()`.

Relationships:

- `leads`: one-to-many relationship to `Lead`.

### `Lead`

Table: `leads`

Fields:

- `id`: integer primary key, indexed.
- `name`: string, max 255.
- `email`: indexed string, max 255.
- `source`: string, max 100, default `website`.
- `status`: string, max 50, default `new`.
- `owner_id`: foreign key to `users.id` with `ON DELETE CASCADE`.
- `created_at`: timezone-aware database timestamp, default `now()`.

Relationships:

- `owner`: many-to-one relationship to `User`.

### `Listing`

Table: `listings`

Fields:

- `id`: integer primary key, indexed.
- `title`: indexed string, max 255.
- `location`: indexed string, max 255.
- `price`: float.
- `size`: integer.
- `description`: text, default empty string.
- `generated_description`: nullable text.
- `created_at`: timezone-aware database timestamp, default `now()`.
- `updated_at`: timezone-aware database timestamp, default `now()`, updated on ORM update.

Relationships:

- None.

## Existing Schemas

### User Schemas

- `UserCreate`: `email`, `name`, `password`.
- `UserLogin`: `email`, `password`.
- `UserRead`: `id`, `email`, `name`, `is_active`, `created_at`.

Validation:

- Emails use `EmailStr`.
- User name must be 1-255 characters.
- Password must be 8-128 characters on registration.

### Token Schema

- `Token`: `access_token`, `token_type`, defaulting to `bearer`.

### Lead Schemas

- `LeadCreate`: `name`, `email`, `source`, `status`.
- `LeadRead`: create fields plus `id`, `owner_id`, `created_at`.

Validation:

- Emails use `EmailStr`.
- Name must be at least 1 character.
- Source and status have max lengths.

### Listing Schemas

- `ListingCreate`: `title`, `location`, `price`, `size`, `description`.
- `ListingRead`: create fields plus `id`, `generated_description`, `created_at`, `updated_at`.

Validation:

- Title and location must be at least 1 character.
- Price must be greater than 0.
- Size must be greater than 0.
- Description defaults to an empty string and allows up to 5000 characters.

## Existing Authentication Functionality

Implemented:

- User registration.
- Duplicate email check during registration.
- Email normalization to lowercase before lookup/storage.
- Password hashing with Passlib `bcrypt`.
- Login with email/password.
- JWT access token generation with `sub` and `exp`.
- Bearer token extraction through `OAuth2PasswordBearer`.
- Current-user dependency that validates token, loads user, and rejects inactive users.
- Protected `/api/v1/auth/me`.
- Protected lead endpoints.

Not implemented or incomplete:

- Refresh tokens.
- Logout/token revocation.
- Password reset.
- Email verification.
- Account lockout/rate limiting.
- Role-based access control.
- Tenant/workspace model.
- Strong production secret handling beyond environment override.
- OAuth2 form-compatible login. The OpenAPI security helper points at `/api/v1/auth/login`, but the login endpoint accepts JSON, not `OAuth2PasswordRequestForm`.

Potential bugs/risks:

- `get_current_user` catches `JWTError`, but `int(user_id)` can raise `ValueError` if the token subject is not numeric.
- Default `SECRET_KEY` is insecure if used outside local development.
- Registration commit is not wrapped in service-level rollback handling, so unexpected database errors may leave session state dirty.
- No tests currently cover registration, login, duplicate user handling, inactive users, expired tokens, or protected endpoint behavior.

## Existing AI Functionality

Implemented:

- Listings can generate a description through OpenAI when the submitted description is empty.
- Uses `OpenAI(api_key=settings.OPENAI_API_KEY)`.
- Calls `client.responses.create`.
- Uses configurable `OPENAI_MODEL`, default `gpt-4o-mini`.
- Keeps generated output short with `max_output_tokens=180`.
- Stores the generated text in both `description` and `generated_description`.
- Skips generation when `OPENAI_API_KEY` is not set.
- Catches `OpenAIError` and falls back to creating the listing without AI text.

Not implemented or incomplete:

- No background job queue.
- No timeout configuration.
- No retry policy.
- No separate endpoint to regenerate descriptions.
- No streaming.
- No user-facing AI failure detail.
- No cost controls, usage tracking, or moderation.
- No ownership/auth check for who may trigger generation.

Potential bugs/risks:

- OpenAI generation is synchronous inside the listing creation request path and may slow or block API responses.
- If the OpenAI client raises a non-`OpenAIError` exception, it is not caught.
- AI output is accepted directly after trimming; there is no validation beyond non-empty text.
- The generated prompt uses raw listing data and does not include structured guardrails for fair housing, compliance, or market-claim safety beyond the instruction string.

## Existing Lead Management Functionality

Implemented:

- Authenticated users can create leads.
- Authenticated users can list only leads where `owner_id` matches their user id.
- Lead model stores name, email, source, status, owner, and creation timestamp.
- Lead read schema returns `owner_id`.

Not implemented or incomplete:

- No lead detail endpoint.
- No lead update endpoint.
- No lead delete/archive endpoint.
- No status transition rules.
- No lead search, filtering, sorting beyond newest-first by id.
- No pagination.
- No deduplication by email.
- No validation against a fixed status enum.
- No tests for lead creation, ownership isolation, or auth requirements.

Potential bugs/risks:

- `source` and `status` are arbitrary strings, so inconsistent values are likely over time.
- Database operations in lead service are not wrapped in rollback handling.
- `owner_id` is exposed in responses; this may be acceptable internally but is not always desirable in public API responses.

## Existing Listing Functionality

Implemented:

- Public listing list endpoint.
- Public listing create endpoint.
- Newest-first listing ordering by descending id.
- Basic request validation through Pydantic.
- Optional AI-generated description when description is empty.
- Database rollback on SQLAlchemy errors during listing creation.
- Tests for AI-generation behavior in the listing service.

Not implemented or incomplete:

- No listing detail endpoint.
- No listing update endpoint.
- No listing delete/archive endpoint.
- No ownership or authentication for creating listings.
- No listing status, draft/published state, images, slug, metadata, or owner.
- No pagination, filtering, or full-text search.
- No validation for currency, units, decimal precision, or extremely large values beyond positive checks.
- No API tests for actual listing endpoints.

Potential bugs/risks:

- Listing routes are mounted twice, creating duplicate public APIs at `/listings` and `/api/v1/listings`.
- Listings are global/public and not associated with users or workspaces.
- The `price` field uses `float`, which can be imprecise for money.
- The root `/listings` endpoints may become a compatibility burden once the versioned API is the primary contract.

## Database and Configuration

Implemented:

- SQLAlchemy declarative base.
- Engine configured from `DATABASE_URL`.
- Session factory through `SessionLocal`.
- Startup table creation through `Base.metadata.create_all`.
- Pydantic settings loaded from `.env`.
- CORS origin list configured through settings.
- `.env.example` documents required backend variables.

Not implemented or incomplete:

- No Alembic migrations.
- No explicit environment separation.
- No test settings module.
- No production-safe default for `SECRET_KEY`.
- No connection pool sizing configuration.
- No database health check beyond app-level `/health`.

Potential bugs/risks:

- `init_db.py` imports `from app import models`, but `app/models/__init__.py` is empty. In the current app startup path, models are registered because routes and services import model modules before `init_db()` runs. Used standalone, `init_db()` may not register every model unless imports happen elsewhere first.
- `create_all` is convenient locally but insufficient for production schema changes.
- `.env` exists locally and should remain uncommitted if this project becomes a git repo.

## Duplicate Routes

Confirmed duplicate listing behavior:

- `app/main.py` mounts `listings.router` at `/listings`.
- `app/api/v1/api.py` mounts the same `listings.router` at `/api/v1/listings`.

Impact:

- Same handlers, schemas, and behavior are exposed at two paths.
- API consumers may rely on both paths.
- Documentation may show both root-level and versioned listing endpoints.
- Future auth/versioning changes could accidentally affect one route family differently if the router is later split.

Recommendation:

- Keep only `/api/v1/listings` as the canonical API path unless root-level `/listings` is intentionally maintained for compatibility.

## Dead Code and Low-Value Code

No clearly unreachable application functions were found in the backend source.

Low-value or suspicious areas:

- `backend/app/routes/listings.py` is both a root route module and versioned route dependency. It is not dead, but its location under `app/routes` is inconsistent with `app/api/v1/endpoints`.
- `python-multipart` is listed in requirements but no file upload or form endpoint currently uses it. It may have been included for future auth/form work.
- Empty `__init__.py` files are package markers and not a problem.
- Generated `__pycache__`, `.pytest_cache`, and local `.venv` are present under `backend`; these are not application code.

## Missing Implementations

- Alembic migrations.
- Auth endpoint tests.
- Lead endpoint/service tests.
- Listing endpoint tests.
- Database test fixture strategy shared across tests.
- User-owned listings or workspace scoping.
- Listing detail/update/delete.
- Lead detail/update/delete.
- Pagination for list endpoints.
- Filtering/searching for leads and listings.
- Error response normalization.
- Logging configuration.
- Request IDs or structured logging.
- Production secret validation.
- Rate limiting.
- Refresh token or cookie-based session strategy.
- CI configuration.

## Incomplete Features

### Authentication

Functional for starter login/register, but not production complete. Needs hardening, tests, token lifecycle decisions, and better OpenAPI login compatibility.

### Listings

Functional create/list module, but not a complete listing management domain. Missing ownership, lifecycle state, detail/update/delete, search, pagination, and money-safe price representation.

### Leads

Functional create/list module with ownership, but not a complete CRM workflow. Missing updates, statuses as enums, lifecycle rules, dedupe, search, and pagination.

### AI

Useful proof of concept, but operationally incomplete. Needs timeout/retry/cost/error controls, compliance considerations, and async/background handling if used heavily.

### Database

Good for local starter use. Needs migrations and reliable model registration before production use.

## Potential Bugs and Risks

1. Duplicate listing routes expose the same behavior at `/listings` and `/api/v1/listings`.
2. Listing creation is public and unauthenticated.
3. Listings are not associated with a user or tenant.
4. `get_current_user` can raise uncaught `ValueError` for non-integer JWT subjects.
5. Swagger/OpenAPI OAuth2 login flow may not work as expected because login accepts JSON, not form data.
6. `SECRET_KEY` has an unsafe default.
7. `init_db()` model registration depends on import order.
8. `create_all` is used instead of migrations.
9. Money is represented as `float`.
10. Lead statuses and sources are free-form strings.
11. No pagination on list endpoints.
12. OpenAI call is synchronous inside listing creation.
13. Auth and lead flows have little or no test coverage.
14. Database commit/rollback handling is inconsistent across services.

## Module Completion Estimates

| Module | Completion Estimate | Notes |
| --- | ---: | --- |
| Application bootstrap and routing | 70% | App creation, CORS, lifespan, health, and routers exist. Needs route cleanup and stronger startup/health behavior. |
| Configuration | 65% | Environment-backed settings exist. Needs production validation and stronger secret handling. |
| Database layer | 45% | Engine/session/base exist. Needs migrations, model import cleanup, test fixtures, and production DB workflow. |
| Authentication | 60% | Register/login/me and JWT work at starter level. Needs tests, token lifecycle, rate limiting, reset/verification, and OpenAPI compatibility. |
| User model/schemas | 65% | Basic user persistence and schemas exist. Needs profile/account lifecycle and security workflows. |
| Listings | 50% | Create/list plus AI description works. Missing ownership, detail/update/delete, pagination, search, and route cleanup. |
| AI listing descriptions | 40% | Proof of concept implemented. Needs operational controls, compliance guardrails, timeout/retry handling, and async strategy. |
| Leads | 45% | Create/list with owner scoping exists. Missing CRUD completeness, status model, search, pagination, and tests. |
| Validation and error handling | 45% | Pydantic validation exists. Needs consistent error shape, stronger domain validation, and more exception handling. |
| Tests | 25% | Health and listing service tests exist. Auth, leads, endpoint behavior, DB behavior, and failure cases are mostly untested. |
| Production readiness | 25% | Good starter base. Needs migrations, deployment config, observability, security hardening, CI, and broader tests. |

Overall backend completion estimate: 50%.

## Next 10 Development Tasks by Priority

1. Remove or formally deprecate duplicate root listing routes and make `/api/v1/listings` canonical.
2. Add Alembic migrations and replace production reliance on `Base.metadata.create_all`.
3. Add authentication tests for register, login, duplicate email, `/me`, invalid token, expired token, and inactive user behavior.
4. Decide listing ownership rules, then require authentication for listing creation and associate listings with users or workspaces.
5. Add endpoint tests for listings and leads using isolated test database fixtures.
6. Implement listing detail, update, and delete/archive endpoints.
7. Implement lead detail, update, and delete/archive endpoints.
8. Add pagination and basic filtering/searching for listing and lead list endpoints.
9. Harden auth and config: enforce non-default `SECRET_KEY` outside local dev, handle malformed JWT subjects, and align login with OpenAPI OAuth2 expectations or document JSON-only login.
10. Improve AI generation reliability with timeout handling, retry policy, clearer failure behavior, and compliance-oriented prompt/output validation.

## Suggested Near-Term Milestone

The next milestone should be "authenticated CRUD foundation":

- Keep only versioned API routes.
- Add migrations.
- Add test fixtures.
- Cover auth with tests.
- Make listings user-owned.
- Add update/delete/detail for listings and leads.

Completing that milestone would move the backend from a starter scaffold to a coherent multi-user API foundation.
