# API Reference

[← Back to index](README.md)

**Base URL (local):** `http://localhost:8000`  
**Swagger UI:** `GET /docs`  
**Health check:** `GET /health` → `{"status": "ok"}`

The frontend proxies all calls through `/api/<path>` → `BACKEND_URL/<path>`.

## Auth — `/auth`

| Method | Path | Auth | Content-Type | Description |
|--------|------|------|--------------|-------------|
| POST | `/auth/register` | None | `multipart/form-data` | Register user. Fields: `email`, `password` (≥8), `name`, `phone_number`, `address?`, `avatar?` |
| POST | `/auth/login` | None | `application/json` | `{email, password}` → `TokenResponse` |

**`TokenResponse`:** `{ user, token, tokenType, role }`

## Cars — `/cars`

| Method | Path | Auth | Content-Type | Description |
|--------|------|------|--------------|-------------|
| GET | `/cars` | None | — | List cars. Query: `category?`, `featured?` |
| GET | `/cars/{car_id}` | None | — | Single car with images |
| POST | `/cars` | **Admin** | `multipart/form-data` | Create car |
| PATCH | `/cars/{car_id}` | **Admin** | `multipart/form-data` | Partial update; can append images |
| DELETE | `/cars/{car_id}` | **Admin** | — | Delete car + images (DB + Cloudinary) |
| PATCH | `/cars/{car_id}/sold` | **Admin** | — | Mark car sold |
| POST | `/cars/{car_id}/images` | **Admin** | `multipart/form-data` | Upload additional images |

**Create/update form fields:** `name`, `brand`, `category`, `condition`, `specs` (JSON string), `description`, `available`, `featured`, `images[]`

**`CarResponse`:** `id`, `name`, `brand`, `category`, `condition`, `images[]`, `specs`, `available`, `featured`, `sold`, `sold_at`, `description`

**Valid categories:** `supercar`, `luxury_sedan`, `sports`, `premium_suv`

## Bookings — `/bookings`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/bookings` | **User** | `{car_id, notes?}` | Create booking |
| GET | `/bookings/me` | **User** | — | Current user's bookings (excludes `car_id = NULL`) |
| GET | `/bookings/{booking_id}` | **User** | — | Owner or admin only |
| PATCH | `/bookings/{booking_id}/cancel` | **User** | — | Cancel own booking |
| GET | `/bookings/admin/stats` | **Admin** | — | Counts by status |
| GET | `/bookings/admin/all` | **Admin** | — | All bookings with user + car |
| PATCH | `/bookings/{booking_id}/approve` | **Admin** | — | Pending → approved |
| PATCH | `/bookings/{booking_id}/reject` | **Admin** | — | Pending → rejected |
| PATCH | `/bookings/{booking_id}/sold` | **Admin** | — | Mark linked car as sold |

**`BookingResponse`:** `id`, `user_id`, `car_id`, `status`, `notes`, `car_name`, `car_brand`, `car_image_url`, `car_condition`, `created_at`, `updated_at`, `cancelled_at`, `car?`

## Images — `/images`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/images/{image_id}` | **Admin** | Delete image from DB + Cloudinary |

## Not Implemented

| Method | Path | Referenced in |
|--------|------|---------------|
| POST | `/contact` | `frontend/lib/api.ts` → `submitContactMessage()` |

## Related Docs

- [Authentication →](auth.md)
- [Business flows →](flows.md)
- [API rules →](rules.md#api-rules)
