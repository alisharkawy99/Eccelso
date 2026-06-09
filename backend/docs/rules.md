# Agent Rules

[← Back to index](README.md)

These rules apply to any AI agent modifying this backend.

## Architecture Rules

1. **Business logic goes in `services/`**, not in `routers/` or `models/`.
2. **Routers stay thin** — parse input, call one service function, return response.
3. **Never query the database from `schemas/`** — schemas are DTOs only.
4. **Do not import routers from services** — dependency direction is always router → service → model.
5. **Match existing patterns** — async functions, `AsyncSession`, `select()` queries, `selectinload` for relations.

## Database Rules

6. **Models are the source of truth** for table structure. Update model + startup migration together.
7. **Respect FK delete behaviors:**
   - `users` → `bookings`: CASCADE
   - `cars` → `bookings`: SET NULL
   - `cars` → `images`: CASCADE
8. **Booking snapshots are immutable history** — do not overwrite `car_name`, `car_brand`, `car_image_url`, `car_condition` after creation.
9. **Car name uniqueness** is enforced in the service layer, not via a DB unique constraint.
10. **Open booking duplicate check** — a user cannot have two bookings with status `pending` or `approved` for the same car.

## Sold Car Rules

11. **Always call `purge_expired_sold_cars()`** before listing or reading cars/bookings (follow existing service patterns).
12. **Marking sold sets three fields:** `sold=True`, `sold_at=now()`, `available=False`.
13. **Public endpoints hide sold cars** after 48 hours via `public_car_filter()`, not by deleting immediately.
14. **Purging deletes Cloudinary assets** before deleting the car row.

## Image Rules

15. **Always store `public_id`** alongside `url` for every Cloudinary upload.
16. **Always destroy Cloudinary assets** before deleting image rows or cars.
17. **Avatar uploads** use folder `eccelso/avatars`; car images use default folder.

## Auth Rules

18. **Use `AdminDep`** for admin-only endpoints, not manual role checks in routers.
19. **Use `CurrentUserDep`** for any authenticated user endpoint.
20. **Never expose `password_hash`** in API responses.
21. **Never add a self-promotion endpoint** for admin role unless explicitly requested.
22. **Registration always creates `role=User`** — admin is DB-only.

## API Rules

23. **Car create/update uses `multipart/form-data`**, not JSON. The `specs` field is a JSON string in the form.
24. **Use existing Pydantic schemas** for request/response — add new schemas rather than returning raw dicts.
25. **Return proper HTTP status codes** — 201 for create, 404 for not found, 409 for conflicts, 403 for forbidden.
26. **`redirect_slashes=False`** on the app — do not rely on trailing-slash redirects.

## Code Change Rules

27. **Minimize scope** — only change what the task requires.
28. **Do not over-engineer** — no extra abstractions, helpers, or error handling for impossible edge cases.
29. **Do not add tests unless asked** — but verify changes don't break existing flows.
30. **Do not commit secrets** — `.env` is gitignored.
31. **Do not update `backend/README.md`** unless asked — it is outdated; `backend/docs/` is the canonical reference.

## Adding New Features

32. **New table?** → Add model, schema, service, router, register router in `main.py`, add startup migration.
33. **New endpoint on existing resource?** → Add service function first, then thin router handler.
34. **New status value?** → Update `BookingStatus` enum in both `models/bookings.py` and `schemas/bookings.py`, and update transitions in `services/bookings.py`.
35. **Frontend proxy exists** — new endpoints are automatically proxied at `/api/<path>` if added to an existing router.
36. **Update docs** — when changing models, endpoints, or business rules, update the relevant file in `backend/docs/` in the same PR.

## Related Docs

- [Architecture overview →](overview.md)
- [Database schema →](database.md)
- [Known gaps →](reference.md)
