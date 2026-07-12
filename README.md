# AssetFlow — Backend

Node.js + Express + MySQL + JWT backend for the AssetFlow frontend (HTML/CSS/JS).
Every module matches the screens already built: Departments, Categories, Employees,
Assets, Allocations, Transfers, Bookings, Maintenance, Audits, Notifications, Reports.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
# edit .env with your MySQL password and a real JWT_SECRET
```

## 3. Create the database

```bash
mysql -u root -p < db/schema.sql
```

## 4. Seed demo data (same accounts as the frontend's demo logins)

```bash
npm run seed
```

This creates:
| Role | Email | Password |
|---|---|---|
| Admin | admin@assetflow.com | admin123 |
| Asset Manager | raj.verma@company.com | demo123 |
| Dept Head | aditi.rao@company.com | demo123 |
| Employee | priya.shah@company.com | demo123 |

## 5. Run

```bash
npm run dev     # nodemon, auto-restart
npm start       # plain node
```

API is at `http://localhost:5000/api`. Health check: `GET /api/health`.

## 6. Test with Postman

Import `postman/AssetFlow.postman_collection.json`. Run **Auth → Login** first —
it auto-saves the JWT into the collection's `token` variable, which every other
request sends as `Authorization: Bearer {{token}}`.

## Folder structure

```
backend/
  server.js               entry point, mounts all routes
  config/db.js             mysql2 connection pool
  middleware/
    auth.js                 requireAuth (JWT) + requireRole (RBAC)
    errorHandler.js          centralized error responses
  utils/
    jwt.js                   sign/verify helpers
    uid.js                    short id generator (matches frontend's uid())
    activity.js               writes activity_log + notifications rows
  routes/                   one file per resource, thin — just wiring
  controllers/              one file per resource — the actual logic
  db/
    schema.sql               full MySQL schema
    seed.js                   loads demo data (hashed passwords)
  postman/
    AssetFlow.postman_collection.json
```

## Auth model

- `POST /api/auth/signup` — always creates an **Employee** role account (role
  promotion happens only via `PUT /api/employees/:id/role`, Admin-only — mirrors
  the frontend's "Editing a department... Role promotion happens only here" rule).
- `POST /api/auth/login` — returns `{ token, user }`.
- Every other route requires `Authorization: Bearer <token>`.
- `requireRole(...)` middleware enforces the same role matrix as the frontend's
  `NAV` config (Admin / AssetManager / DeptHead / Employee).

## Endpoints (all prefixed `/api`)

| Resource | Routes |
|---|---|
| auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| departments | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| categories | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| employees | `GET /`, `GET /:id`, `PUT /:id/role`, `PUT /:id/status`, `PUT /:id/department` |
| assets | `GET /?q=&status=&category=`, `GET /:id`, `POST /`, `PUT /:id`, `PUT /:id/status`, `DELETE /:id` |
| allocations | `GET /`, `POST /`, `PUT /:id/return` |
| transfers | `GET /`, `POST /`, `PUT /:id/decision` |
| bookings | `GET /?assetId=&date=`, `POST /` (conflict-checked), `PUT /:id/cancel` |
| maintenance | `GET /`, `POST /`, `PUT /:id/status` (kanban) |
| audits | `GET /`, `POST /`, `PUT /items/:itemId`, `PUT /:id/close` |
| notifications | `GET /`, `PUT /read-all`, `PUT /:id/read` |
| reports | `GET /dashboard`, `GET /activity`, `GET /assets.csv` |

## Business rules carried over from the frontend logic

- Registering an asset auto-generates the next `AF-00xx` tag.
- Allocating an asset fails with `409` if it isn't `Available`; on success the
  asset flips to `Allocated`. Marking a return flips it back to `Available`.
- Approving a transfer closes the old allocation and opens a new one to the
  new holder, in a single DB transaction.
- Booking a non-bookable asset is rejected; overlapping time windows on the
  same asset are rejected with `409`.
- Moving a maintenance ticket to `Approved/TechnicianAssigned/InProgress` sets
  the asset to `UnderMaintenance`; `Resolved` sets it back to `Available`.
- Closing an audit cycle flags any `Missing` item's asset as `Lost`.
- Every mutating action writes a row to `activity_log`, and most also push a
  `notifications` row — same as the frontend's `log()` / `notify()` helpers.

## Connecting the existing frontend

The current `script.js` is a self-contained in-memory demo. To wire it to this
API, replace the in-memory `S` mutations with `fetch()` calls to these
endpoints (store the JWT from `/auth/login` in memory/localStorage and send it
as `Authorization: Bearer <token>` on every request). Happy to do that wiring
next if you share how you'd like state/rendering to work with real async data.
