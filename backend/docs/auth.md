# Authentication & Authorization

[← Back to index](README.md)

## JWT Flow

1. Client sends `Authorization: Bearer <token>`
2. `get_current_user()` in `app/dependencies/auth.py`:
   - Validates Bearer scheme
   - Decodes JWT (`sub` = user email, `exp` = 30 min)
   - Loads user from DB; rejects if missing or `is_active=False`
3. `require_admin()` additionally checks `user.role == RoleEnum.ADMIN`

## Dependency Types

| Dependency | Usage |
|------------|-------|
| `SessionDep` | Injects async DB session |
| `CurrentUserDep` | Any authenticated active user |
| `AdminDep` | Admin role required |

## Role Model

| Role | Value | How Created |
|------|-------|-------------|
| `User` | `"User"` | Default on registration |
| `Admin` | `"Admin"` | **Manual DB update only** — no API endpoint |

To promote a user to admin:

```sql
UPDATE users SET role = 'Admin' WHERE email = 'admin@example.com';
```

## Registration & Login Summary

| Step | Endpoint | Result |
|------|----------|--------|
| Register | `POST /auth/register` | Creates user with `role=User`. No token returned. |
| Login | `POST /auth/login` | Returns JWT (30 min) + user profile |

Password requirements: minimum 8 characters, hashed with Argon2.

## Security Notes

- JWT secret is loaded from the **`JWT_SECRET`** environment variable (`app/config.py`)
- No refresh tokens — 30-minute access tokens only
- Passwords hashed with **Argon2** via `argon2-cffi`
- Frontend has a **separate client-side admin password** on the car admin page — this does **not** grant backend admin access
- Backend admin endpoints require a JWT for a user with `role=Admin`

## Frontend Token Storage

- Cookie: `authToken` (set on login)
- User profile: `sessionStorage` key `user`
- Axios interceptor attaches Bearer token (`frontend/lib/api.ts`)

## Related Docs

- [Auth rules →](rules.md#auth-rules)
- [Registration flow →](flows.md#user-registration--login)
- [API auth endpoints →](api.md#auth--auth)
