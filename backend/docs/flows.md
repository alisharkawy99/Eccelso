# Business Flows

[← Back to index](README.md)

## User Registration & Login

```mermaid
sequenceDiagram
    participant Client
    participant Router as /auth
    participant Service as services/users
    participant DB as PostgreSQL
    participant CDN as Cloudinary

    Client->>Router: POST /auth/register (multipart)
    Router->>Service: create_user()
    Service->>DB: Check email unique
    alt email exists
        Service-->>Client: 409 Conflict
    end
    Service->>Service: Hash password (Argon2)
    opt avatar provided
        Service->>CDN: Upload to eccelso/avatars
    end
    Service->>DB: INSERT users (role=User)
    Service-->>Client: 201 {message}

    Client->>Router: POST /auth/login (JSON)
    Router->>Service: login()
    Service->>DB: Find user by email
    Service->>Service: Verify Argon2 hash
    Service->>Service: Create JWT (30 min, sub=email)
    Service-->>Client: TokenResponse {user, token, role}
```

## Public Car Catalog

```mermaid
sequenceDiagram
    participant Client
    participant Service as services/cars + sold_cars
    participant DB as PostgreSQL
    participant CDN as Cloudinary

    Client->>Service: GET /cars or GET /cars/{id}
    Service->>Service: purge_expired_sold_cars()
    loop each expired sold car (>48h)
        Service->>CDN: destroy image public_ids
        Service->>DB: DELETE car (bookings.car_id → NULL)
    end
    Service->>Service: public_car_filter()
    Note over Service: Show unsold OR sold within last 48h
    Service->>DB: SELECT cars + images
    Service-->>Client: CarResponse[]
```

**Sold car visibility rule:** `SOLD_VISIBILITY_HOURS = 48` in `services/sold_cars.py`

## Admin Car Management

```mermaid
sequenceDiagram
    participant Admin
    participant Router as /cars
    participant Service as services/cars
    participant DB as PostgreSQL
    participant CDN as Cloudinary

    Admin->>Router: POST /cars (multipart, Admin JWT)
    Router->>Service: create_car()
    Service->>DB: Check name unique
    Service->>DB: INSERT car
    loop each image file
        Service->>CDN: upload
        Service->>DB: INSERT image
    end
    Service-->>Admin: CarResponse

    Admin->>Router: PATCH /cars/{id}/sold
    Router->>Service: mark_car_sold()
    Service->>DB: sold=true, sold_at=now, available=false
    Service-->>Admin: CarResponse
```

## Booking Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Admin
    participant Service as services/bookings
    participant DB as PostgreSQL

    User->>Service: POST /bookings {car_id, notes?}
    Service->>Service: Validate car exists & not sold
    Service->>Service: Check no open booking for user+car
    Service->>DB: INSERT booking (status=pending, snapshots)
    Service-->>User: BookingResponse

    Admin->>Service: PATCH /bookings/{id}/approve
    Service->>DB: status=approved

    alt sale completed
        Admin->>Service: PATCH /bookings/{id}/sold
        Service->>Service: mark_car_sold()
        Service->>DB: car.sold=true
    end

    opt user changes mind
        User->>Service: PATCH /bookings/{id}/cancel
        Service->>DB: status=cancelled, cancelled_at=now
    end
```

## Sold Car Purge

Runs automatically before most car/booking reads — not a cron job.

```
Trigger: list_cars, get_car, create_booking, list_user_bookings, etc.
Condition: car.sold = true AND car.sold_at < now - 48 hours
Actions:
  1. Delete all images from Cloudinary (by public_id)
  2. DELETE car from DB
  3. Related bookings: car_id becomes NULL (FK SET NULL)
  4. Booking snapshots (car_name, car_brand, etc.) preserved
```

## Related Docs

- [Database schema →](database.md)
- [API endpoints →](api.md)
- [Sold car rules →](rules.md#sold-car-rules)
