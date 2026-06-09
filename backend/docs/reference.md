# Reference

[← Back to index](README.md)

## Known Gaps & Gotchas

| Issue | Detail |
|-------|--------|
| No `/contact` endpoint | Frontend `submitContactMessage()` posts to `/contact` — will 404 |
| No orders table | Use bookings for all customer inquiry flows |
| No admin registration API | Set `role = 'Admin'` directly in PostgreSQL |
| `JWT_SECRET` required | Must be set in env / `backend/.env` — see `backend/.env.example` |
| Dual admin auth | Frontend admin page uses client password; backend requires JWT with `Admin` role |
| `backend/README.md` outdated | Describes old JSON-based car API; current API uses multipart |
| Category naming | Schema uses `sports`; frontend may use `sport` in some places — verify before filtering |
| `mark_car_sold` import | Router imports from `services.cars` which re-imports from `services.sold_cars` — works but indirect |

## File Map

| Concern | File(s) |
|---------|---------|
| App entry + migrations | `main.py` |
| Settings | `app/config.py` |
| DB engine + session | `app/database.py` |
| JWT auth | `app/dependencies/auth.py` |
| Password + tokens | `app/utils/security.py` |
| User model | `models/users.py` |
| Car model | `models/cars.py` |
| Booking model | `models/bookings.py` |
| Image model | `models/images.py` |
| Auth routes | `routers/users.py` |
| Car routes | `routers/cars.py` |
| Booking routes | `routers/bookings.py` |
| Image routes | `routers/images.py` |
| User logic | `services/users.py` |
| Car logic | `services/cars.py` |
| Sold car logic | `services/sold_cars.py` |
| Booking logic | `services/bookings.py` |
| Image logic | `services/images.py` |
| User DTOs | `schemas/users.py` |
| Car DTOs | `schemas/cars.py` |
| Booking DTOs | `schemas/bookings.py` |
| Image DTOs | `schemas/images.py` |
| Frontend proxy | `frontend/app/api/[...path]/route.ts` |
| Frontend API client | `frontend/lib/api.ts` |
| Deployment | `render.yaml` |
| Agent docs | `backend/docs/` |

## Related Docs

- [Full doc index →](README.md)
- [Agent rules →](rules.md)
