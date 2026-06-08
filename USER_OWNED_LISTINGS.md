# User-Owned Listings

Date: 2026-06-09

## Summary

Listings now record the user who created them. Listing creation requires authentication, and the authenticated user is assigned as the owner automatically.

This change is intentionally minimal:

- No roles were added.
- No permissions system was added.
- No listing update or delete endpoints were added.
- AI description generation behavior was not changed.
- `GET /api/v1/listings` still returns all listings for now.

## Schema Changes

The `listings` table now has:

- `owner_id`: integer, not nullable.
- Foreign key: `listings.owner_id -> users.id`.
- Delete behavior: `ON DELETE CASCADE`.
- Index: `ix_listings_owner_id`.

SQLAlchemy relationships:

- `User.listings` maps a user to their listings.
- `Listing.owner` maps a listing to its owner.

The existing listing response schema was not changed, so API responses continue to use the existing response shape.

## API Changes

### `GET /api/v1/listings`

Behavior is unchanged. It remains public and returns all listings.

### `POST /api/v1/listings`

This endpoint now requires a bearer token.

The request payload is unchanged. Clients do not send `owner_id`; the backend assigns it from the authenticated user.

Unauthenticated or invalid-token requests are rejected by the existing FastAPI auth dependency with `401 Unauthorized`.

## Service Changes

`ListingService.create_listing` now accepts the authenticated `User` and persists `owner_id=owner.id`.

AI description generation is still driven only by whether `description` is empty, exactly as before.

## Migration Details

New migration:

- `backend/migrations/versions/0002_user_owned_listings.py`

Upgrade behavior:

- Adds `owner_id` to `listings`.
- Adds index `ix_listings_owner_id`.
- Adds foreign key `fk_listings_owner_id_users`.

Downgrade behavior:

- Drops the foreign key.
- Drops the owner index.
- Drops `owner_id`.

Run from `backend`:

```bash
alembic upgrade head
```

Downgrade this change:

```bash
alembic downgrade 0001_initial_schema
```

## Test Coverage

Added coverage for:

- Authenticated listing creation using the current user.
- Listing owner assignment in the service.
- Listing creation route requiring the `get_current_user` dependency.
- Invalid listing creation authentication returning `401`.

Existing listing AI behavior tests were updated to pass an owner and continue asserting the same generated-description behavior.

## Assumptions

- Existing listings are not backfilled by this migration.
- The migration is intended for the current starter-stage database shape.
- Listing visibility is intentionally unchanged; ownership is recorded now, but list filtering by owner is deferred.
