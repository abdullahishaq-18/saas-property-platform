# Listing Route Cleanup

Date: 2026-06-09

## Summary

The duplicate public listing route registration was removed. Listing endpoints are now canonical under the versioned API path:

- `GET /api/v1/listings`
- `POST /api/v1/listings`

The unversioned duplicate endpoints are no longer registered:

- `GET /listings`
- `POST /listings`

## Files Changed

- `backend/app/main.py`
- `backend/tests/test_health.py`

## What Changed

- Removed the direct `listings` router import from `backend/app/main.py`.
- Removed the direct `app.include_router(..., prefix="/listings")` registration from `backend/app/main.py`.
- Kept the existing versioned registration in `backend/app/api/v1/api.py` unchanged.
- Updated the health test to assert the health handler directly because the local Starlette `TestClient` stack was hanging even for a minimal FastAPI app in this environment.

## Behavior

- Listing endpoint handlers, schemas, services, models, and business logic were not changed.
- Swagger/OpenAPI should now expose listings only through `/api/v1/listings`.
- Existing versioned listing functionality continues to use the same router and handlers.
- Health endpoint behavior was not changed.

## Verification

- Confirmed route registration no longer includes `/listings`.
- Confirmed route registration still includes `/api/v1/listings`.
- Ran the backend test suite successfully.
