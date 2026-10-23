# Car Dealership Inventory System — Requirements Specification

## 1. Project Overview & Scope
The Car Dealership Inventory System is a full-stack, production-grade web application designed to manage dealership vehicle inventory, facilitate vehicle purchasing with race-safe concurrency controls, and provide role-based administrative capabilities (adding, editing, deleting, restocking vehicles).

The system consists of:
- **Backend**: NestJS (Node.js 20+ & TypeScript), Prisma ORM, PostgreSQL database, Passport/JWT authentication, RBAC, Rate limiting, Helmet, and strict validation.
- **Frontend**: React 18 (Vite, TypeScript, Tailwind CSS), React Router 6, React Hook Form, Axios with interceptors, responsive and accessible UI with toast notifications.
- **Infrastructure & Quality**: Docker Compose multi-service setup (PostgreSQL app & test instances), Jest + Supertest integration testing, Vitest + React Testing Library component testing, GitHub Actions CI.

---

## 2. User Roles & Capabilities
The system supports two distinct roles:
1. `USER` (Default authenticated role):
   - Register an account (always assigned `USER` role; register body ignores or rejects external role parameter).
   - Log in to obtain a JSON Web Token (JWT).
   - View paginated vehicle list (`GET /api/vehicles`).
   - Search and filter vehicles with multiple criteria (`GET /api/vehicles/search`).
   - Purchase an in-stock vehicle atomically (`POST /api/vehicles/:id/purchase`).
   - Create new vehicle entries (`POST /api/vehicles`) per specification.
   - Update existing vehicle details (`PUT /api/vehicles/:id`) per specification.

2. `ADMIN` (Superuser / Dealership Manager):
   - Inherits all `USER` capabilities.
   - Delete vehicles from inventory (`DELETE /api/vehicles/:id`).
   - Restock vehicles with additional quantity (`POST /api/vehicles/:id/restock`).
   - Initial `ADMIN` is provisioned via an automated database seed script reading secure credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) from environment variables.

---

## 3. Data Models & Entity Specifications

### 3.1 `User` Entity
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID (v4) | Primary Key, Default: `uuid()` | Unique user identifier |
| `email` | String | Unique, Validated Email format | User login and contact email |
| `passwordHash` | String | Hidden in JSON transformations | Bcrypt hashed password (cost factor 10+) |
| `role` | Enum (`USER`, `ADMIN`) | Default: `USER` | Role for RBAC authorization |
| `createdAt` | DateTime | Default: `now()` | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated on modification | Timestamp of last user update |

### 3.2 `Vehicle` Entity
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID (v4) | Primary Key, Default: `uuid()` | Unique vehicle identifier |
| `make` | String | Min 1, Max 50 chars, trimmed | Vehicle manufacturer (e.g. Toyota, Tesla) |
| `model` | String | Min 1, Max 50 chars, trimmed | Model name (e.g. Camry, Model 3) |
| `category` | String | Min 1, Max 50 chars, trimmed | Category/class (e.g. Sedan, SUV, Truck, Coupe) |
| `price` | Decimal (10, 2) | > 0 | Price in USD / local currency |
| `quantity` | Integer | >= 0 | Available units in inventory |
| `createdAt` | DateTime | Default: `now()` | Timestamp of addition to inventory |
| `updatedAt` | DateTime | Auto-updated on modification | Timestamp of last inventory record update |

---

## 4. API Specification & Status Codes

All API endpoints reside under prefix `/api`. Consistent error envelope:
```json
{
  "statusCode": 400,
  "message": "Detailed error message or validation array",
  "error": "Bad Request",
  "timestamp": "2026-10-23T18:00:00.000Z",
  "path": "/api/vehicles"
}
```

### 4.1 Authentication Endpoints
- **`POST /api/auth/register`**
  - **Auth**: Public (Strict rate limiting applied)
  - **Body**: `{ email: string, password: string }` (min 8 chars, mixed complexity)
  - **Behavior**: Validates input, hashes password with bcrypt, enforces unique email. Default role is `USER`.
  - **Status Codes**:
    - `201 Created`: User successfully registered (returns `{ id, email, role, createdAt }`, no password hash).
    - `400 Bad Request`: Validation failure.
    - `409 Conflict`: Duplicate email already registered.

- **`POST /api/auth/login`**
  - **Auth**: Public (Strict rate limiting applied)
  - **Body**: `{ email: string, password: string }`
  - **Behavior**: Validates credentials using constant-time comparison; issues signed JWT.
  - **Status Codes**:
    - `200 OK`: Returns `{ accessToken, user: { id, email, role } }`.
    - `400 Bad Request`: Missing or malformed credentials.
    - `401 Unauthorized`: Generic error message: `"Invalid credentials"`.

### 4.2 Vehicles Endpoints
- **`POST /api/vehicles`**
  - **Auth**: Authenticated (`JwtAuthGuard`)
  - **Body**: `{ make: string, model: string, category: string, price: number, quantity: number }`
  - **Status Codes**:
    - `201 Created`: Returns newly created Vehicle object.
    - `400 Bad Request`: Validation error (`price <= 0` or `quantity < 0`).
    - `401 Unauthorized`: Missing or invalid Bearer token.

- **`GET /api/vehicles`**
  - **Auth**: Authenticated (`JwtAuthGuard`)
  - **Query Params**: `page` (default 1, >= 1), `limit` (default 10, max 100)
  - **Status Codes**:
    - `200 OK`: Returns `{ data: Vehicle[], meta: { total, page, limit, totalPages } }`.
    - `401 Unauthorized`: Token missing or expired.

- **`GET /api/vehicles/search`** *(CRITICAL: Declared before `/:id`)*
  - **Auth**: Authenticated (`JwtAuthGuard`)
  - **Query Params**:
    - `make` (optional string): case-insensitive partial match
    - `model` (optional string): case-insensitive partial match
    - `category` (optional string): case-insensitive partial match
    - `minPrice` (optional number, >= 0)
    - `maxPrice` (optional number, >= 0)
    - `page` (default 1), `limit` (default 10)
  - **Validation**: Enforce `minPrice <= maxPrice` if both provided; throw `400 Bad Request` if invalid.
  - **Status Codes**:
    - `200 OK`: Returns filtered vehicle collection.
    - `400 Bad Request`: Invalid filter parameters (`minPrice > maxPrice`).
    - `401 Unauthorized`.

- **`PUT /api/vehicles/:id`**
  - **Auth**: Authenticated (`JwtAuthGuard`)
  - **Param**: `id` (UUID format)
  - **Body**: Partial vehicle fields (`make?`, `model?`, `category?`, `price?`, `quantity?`)
  - **Status Codes**:
    - `200 OK`: Returns updated Vehicle.
    - `400 Bad Request`: Invalid UUID or invalid field types/values.
    - `404 Not Found`: Vehicle with given UUID does not exist.

- **`DELETE /api/vehicles/:id`**
  - **Auth**: Authenticated (`JwtAuthGuard`), Admin only (`RolesGuard`, `@Roles(Role.ADMIN)`)
  - **Param**: `id` (UUID format)
  - **Status Codes**:
    - `204 No Content`: Vehicle successfully deleted.
    - `403 Forbidden`: Authenticated user is not an `ADMIN`.
    - `404 Not Found`: Vehicle does not exist.

### 4.3 Inventory Operations
- **`POST /api/vehicles/:id/purchase`**
  - **Auth**: Authenticated (`JwtAuthGuard`)
  - **Param**: `id` (UUID format)
  - **Concurrency & Atomicity**: Atomic conditional update (`quantity > 0`) preventing race conditions and negative inventory.
  - **Status Codes**:
    - `200 OK`: Returns updated Vehicle with decremented quantity.
    - `404 Not Found`: Vehicle ID not found.
    - `409 Conflict`: Vehicle is out of stock (`quantity === 0`).

- **`POST /api/vehicles/:id/restock`**
  - **Auth**: Authenticated (`JwtAuthGuard`), Admin only (`RolesGuard`, `@Roles(Role.ADMIN)`)
  - **Param**: `id` (UUID format)
  - **Body**: `{ amount: integer > 0 }`
  - **Status Codes**:
    - `200 OK`: Returns updated Vehicle with incremented quantity.
    - `400 Bad Request`: `amount <= 0` or missing.
    - `403 Forbidden`: Non-admin access.
    - `404 Not Found`: Vehicle does not exist.

---

## 5. Security & Non-Functional Requirements
1. **Password Security**: Bcrypt with salt rounds >= 10. Passwords must be at least 8 characters with at least one number and one letter.
2. **Data Exposure**: Password hashes are stripped before serialization; error handlers suppress stack traces in non-development modes.
3. **HTTP Hardening**: Helmet for secure headers; strict CORS allow-list configured via `CORS_ORIGIN`.
4. **Rate Limiting**: NestJS Throttler applied globally (e.g. 60 req/min) with aggressive throttling on authentication endpoints (e.g. 5 req/min).
5. **Input Sanitation & Validation**: Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to prevent mass assignment vulnerabilities.
6. **Data Isolation**: Dedicated test database with automatic truncation between test cases for complete test idempotency.

---

## 6. Assumptions & Implementation Decisions
1. **Route Precedence**: `GET /api/vehicles/search` must be explicitly registered prior to `GET /api/vehicles/:id` in NestJS routing table to avoid treating literal `'search'` as a UUID parameter.
2. **Vehicle Add/Update Authorization**: Based on the kata specification, `POST /api/vehicles` and `PUT /api/vehicles/:id` are protected for all authenticated users; `DELETE /api/vehicles/:id` and restock are strictly `ADMIN` only.
3. **Atomic Purchase Execution**: Handled via Prisma conditional update (`updateMany({ where: { id, quantity: { gt: 0 } }, data: { quantity: { decrement: 1 } } })`) or serializable transaction, ensuring guaranteed atomicity even under parallel purchase requests.
4. **Token Storage**: Frontend persists the JWT in `localStorage` for responsive client-side routing, documented in the architectural decision log comparing localStorage vs HTTP-only cookies.
