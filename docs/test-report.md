# Comprehensive Test Report & Verification Evidence

**Project:** Car Dealership Inventory System  
**Date:** October 24, 2026  
**Status:** ALL TESTS PASSING (100% Pass Rate)

---

## 1. Executive Summary

| Test Category | Suite Count | Total Tests | Passed | Failed | Pass Rate | Coverage / Output |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Backend Unit Tests** | 11 suites | 56 tests | 56 | 0 | 100% | **95.19% Statements** |
| **Backend E2E Integration** | 4 suites | 29 tests | 29 | 0 | 100% | 100% Endpoints Verified |
| **Backend Concurrency** | 1 suite | 1 test (10 reqs) | 1 | 0 | 100% | Race-Safe (0 stock floor) |
| **Automated HTTP Smoke Test** | 1 script | 18 tests | 18 | 0 | 100% | Live HTTP Execution |
| **Frontend Component Tests** | 3 suites | 8 tests | 8 | 0 | 100% | Vitest + React Testing Library |
| **Frontend Static Analysis** | ESLint | - | - | 0 | 100% | 0 Errors, 0 Warnings |
| **Frontend Production Build** | TypeScript + Vite | - | - | 0 | 100% | Production dist created |
| **Backend Static Analysis** | ESLint | - | - | 0 | 100% | 0 Errors, 0 Warnings |
| **Backend Production Build** | NestJS CLI | - | - | 0 | 100% | Production dist created |

---

## 2. Backend Unit Test Coverage Report

Generated via `npm run test:cov` against Jest unit test suites:

```text
PASS src/common/filters/http-exception.filter.spec.ts (15.37 s)
PASS src/common/guards/roles.guard.spec.ts (16.493 s)
PASS src/modules/users/users.service.spec.ts (16.577 s)
PASS src/modules/vehicles/vehicles.service.spec.ts (16.688 s)
PASS src/modules/inventory/inventory.service.spec.ts (16.681 s)
PASS src/modules/auth/strategies/jwt.strategy.spec.ts (17.057 s)
PASS src/modules/auth/auth.service.spec.ts (18.148 s)
PASS src/modules/auth/auth.controller.spec.ts (18.683 s)
PASS src/common/guards/jwt-auth.guard.spec.ts (18.954 s)
PASS src/modules/inventory/inventory.controller.spec.ts (20.794 s)
PASS src/modules/vehicles/vehicles.controller.spec.ts (20.861 s)
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------|---------|----------|---------|---------|-------------------
All files                  |   95.19 |    70.83 |    97.5 |   94.53 |                   
 common/decorators         |   45.45 |        0 |      50 |   33.33 |                   
  get-user.decorator.ts    |       0 |        0 |       0 |       0 | 1-9               
  roles.decorator.ts       |     100 |      100 |     100 |     100 |                   
 common/filters            |    82.6 |    30.76 |     100 |   80.95 |                   
  http-exception.filter.ts |    82.6 |    30.76 |     100 |   80.95 | 30-33             
 common/guards             |     100 |      100 |     100 |     100 |                   
  jwt-auth.guard.ts        |     100 |      100 |     100 |     100 |                   
  roles.guard.ts           |     100 |      100 |     100 |     100 |                   
 modules/auth              |     100 |       80 |     100 |     100 |                   
  auth.controller.ts       |     100 |      100 |     100 |     100 |                   
  auth.service.ts          |     100 |       80 |     100 |     100 | 66                
 modules/auth/strategies   |     100 |    66.66 |     100 |     100 |                   
  jwt.strategy.ts          |     100 |    66.66 |     100 |     100 | 23                
 modules/inventory         |     100 |      100 |     100 |     100 |                   
  inventory.controller.ts  |     100 |      100 |     100 |     100 |                   
  inventory.service.ts     |     100 |      100 |     100 |     100 |                   
 modules/users             |     100 |      100 |     100 |     100 |                   
  users.service.ts         |     100 |      100 |     100 |     100 |                   
 modules/vehicles          |     100 |      100 |     100 |     100 |                   
  vehicles.controller.ts   |     100 |      100 |     100 |     100 |                   
  vehicles.service.ts      |     100 |      100 |     100 |     100 |                   
---------------------------|---------|----------|---------|---------|-------------------

Test Suites: 11 passed, 11 total
Tests:       56 passed, 56 total
Snapshots:   0 total
Time:        32.358 s
```

---

## 3. Backend E2E Test Suite Output

Executed against dedicated PostgreSQL test database:

```text
> car-dealership-inventory-backend@1.0.0 test:e2e
> jest --config ./test/jest-e2e.json --runInBand --detectOpenHandles

PASS test/auth.e2e-spec.ts (12.21 s)
  Auth Endpoints (e2e)
    POST /api/auth/register
      √ should register a new user successfully (201)
      √ should reject invalid email or weak password (400)
      √ should reject registration if email is already taken (409)
      √ should ignore any supplied role property and always enforce USER role (201)
    POST /api/auth/login
      √ should log in successfully with correct credentials (200)
      √ should reject login with wrong password using generic error (401)
      √ should reject login with non-existent email using generic error (401)
      √ should reject empty login body (400)

PASS test/vehicles.e2e-spec.ts (6.47 s)
  Vehicles Endpoints (e2e)
    POST /api/vehicles
      √ should create a vehicle when authenticated (201)
      √ should reject unauthenticated vehicle creation (401)
      √ should reject creation with negative price or invalid fields (400)
    GET /api/vehicles
      √ should return paginated list of vehicles (200)
      √ should paginate results using page and limit query params (200)
    GET /api/vehicles/search
      √ should filter vehicles by make, model, category, and price range (200)
      √ should reject search when minPrice > maxPrice (400)
      √ correctly resolves /search without matching /:id route (200)
    GET /api/vehicles/:id
      √ should return a single vehicle by id (200)
      √ should return 404 when vehicle id is missing
    PUT /api/vehicles/:id
      √ should partially update a vehicle (200)
      √ should return 404 when updating non-existent vehicle
    DELETE /api/vehicles/:id
      √ should allow ADMIN to delete a vehicle (204)
      √ should forbid non-admin user from deleting vehicle (403)
      √ should return 404 when admin deletes non-existent vehicle

PASS test/inventory.e2e-spec.ts
  Inventory Endpoints (e2e)
    POST /api/vehicles/:id/purchase
      √ should allow authenticated user to purchase an in-stock vehicle (200)
      √ should return 409 Conflict when vehicle is out of stock (quantity = 0)
      √ should return 404 Not Found when purchasing non-existent vehicle
      √ should reject unauthenticated purchase request (401)
    POST /api/vehicles/:id/restock (ADMIN Only)
      √ should allow ADMIN to restock a vehicle by amount (200)
      √ should forbid non-admin user from restocking (403)
      √ should reject non-positive or invalid restock amount (400)
      √ should return 404 for ADMIN if vehicle does not exist to restock

PASS test/concurrency.e2e-spec.ts
  Inventory Concurrency & Race-Safety Test (e2e)
    √ should handle simultaneous concurrent purchases safely without overselling below 0 (10 parallel requests on stock of 3)

Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        26.255 s
```

---

## 4. Concurrency Stress Test Results

- **Initial State:** Vehicle created with `quantity: 3`.
- **Load Applied:** 10 simultaneous asynchronous `POST /api/vehicles/:id/purchase` requests executed in parallel via `Promise.all()`.
- **Results:**
  - **Successful Purchases (200 OK):** Exactly 3 requests.
  - **Failed Purchases (409 Conflict):** Exactly 7 requests.
  - **Final Database State:** Vehicle quantity = `0`.
  - **Overselling Check:** Quantity never dropped below 0. Race condition prevented by PostgreSQL conditional row update (`WHERE id = :id AND quantity > 0`).

---

## 5. Live HTTP Smoke Test Suite

Executed via `npx ts-node scripts/smoke-test.ts` against the live running NestJS server:

```text
======================================================
Starting Automated HTTP Smoke Test against: http://localhost:3000/api
======================================================

  [PASS] 1. POST /api/auth/register -> 201 Created
  [PASS] 2. POST /api/auth/register duplicate email -> 409 Conflict
  [PASS] 3. POST /api/auth/login -> 200 OK with accessToken
  [PASS] 4. POST /api/auth/login invalid credentials -> 401 Unauthorized
  [PASS] 5. POST /api/auth/login as Admin -> 200 OK (ADMIN role)
  [PASS] 6. POST /api/vehicles (auth) -> 201 Created
  [PASS] 7. GET /api/vehicles (auth) -> 200 OK paginated list
  [PASS] 8. GET /api/vehicles/search (auth) -> 200 OK search filtered
  [PASS] 9. GET /api/vehicles/search (minPrice > maxPrice) -> 400 Bad Request
  [PASS] 10. PUT /api/vehicles/:id (auth) -> 200 OK partial update
  [PASS] 11. POST /api/vehicles/:id/purchase -> 200 OK (decrements to 1)
  [PASS] 12. POST /api/vehicles/:id/purchase -> 200 OK (decrements to 0)
  [PASS] 13. POST /api/vehicles/:id/purchase at zero stock -> 409 Conflict
  [PASS] 14. POST /api/vehicles/:id/restock non-admin -> 403 Forbidden
  [PASS] 15. POST /api/vehicles/:id/restock as ADMIN -> 200 OK (restocked to 5)
  [PASS] 16. DELETE /api/vehicles/:id non-admin -> 403 Forbidden
  [PASS] 17. DELETE /api/vehicles/:id as ADMIN -> 204 No Content
  [PASS] 18. GET /api/vehicles/:id after deletion -> 404 Not Found

======================================================
HTTP Smoke Test Results: 18 Passed, 0 Failed
======================================================
```

---

## 6. Frontend Vitest & React Testing Library Suite

Executed via `npm run test:run` in `frontend/`:

```text
 RUN  v2.1.9 frontend

 ✓ src/test/SearchBar.test.tsx (2 tests) 162ms
   ✓ SearchBar Component Tests > renders search input and filters
   ✓ SearchBar Component Tests > triggers debounced search on input change
 ✓ src/test/VehicleCard.test.tsx (4 tests) 209ms
   ✓ VehicleCard Component Tests > renders vehicle details correctly
   ✓ VehicleCard Component Tests > disables Purchase button and displays Out of Stock badge when quantity is 0
   ✓ VehicleCard Component Tests > renders Admin controls only when isAdmin is true
   ✓ VehicleCard Component Tests > calls onPurchase when Purchase button is clicked
 ✓ src/test/Forms.test.tsx (2 tests) 458ms
   ✓ Form Validation Component Tests > validates required fields on Login form submission
   ✓ Form Validation Component Tests > validates password complexity on Register form submission

 Test Files  3 passed (3)
      Tests  8 passed (8)
   Duration  8.64s
```

---

## 7. Security Review & OWASP Top 10 Assessment

| OWASP Vulnerability | Risk Mitigated | Implementation Mechanism | Verified In |
| :--- | :---: | :--- | :--- |
| **A01: Broken Access Control** | High | `JwtAuthGuard` applied across endpoints; `@Roles(Role.ADMIN)` & `RolesGuard` strictly protect `DELETE` and restock; JWT interceptor. Non-admin received 403. | `test/vehicles.e2e-spec.ts`, `test/inventory.e2e-spec.ts` |
| **A02: Cryptographic Failures** | High | Passwords hashed using `bcrypt` (10 salt rounds); password hashes excluded from user DTOs; JWT tokens signed with SHA-256 and expiry. | `auth.service.ts`, `auth.e2e-spec.ts` |
| **A03: Injection** | Critical | Parameterized queries via Prisma ORM preventing SQL injection; validation DTOs enforce types. | `prisma-vehicles.repository.ts` |
| **A04: Insecure Design** | High | Atomic row updates (`quantity: { decrement: 1 } WHERE quantity > 0`) guarantee no negative inventory race conditions. Route ordering ensures `/search` is not masked by `/:id`. | `test/concurrency.e2e-spec.ts`, `vehicles.controller.ts` |
| **A05: Security Misconfiguration** | Medium | `helmet` configured for security headers (HSTS, X-Content-Type-Options, Frameguard); CORS allow-list restricted via `CORS_ORIGIN`. | `main.ts` |
| **A06: Vulnerable Components** | Medium | Dependency scanning performed via `npm audit`. Transitive build-time CLI tools evaluated; zero runtime execution vulnerabilities exposed. | Section 8 of this report |
| **A07: Identification & Auth Failures** | High | Generic error response `"Invalid email or password"` prevents account enumeration; strict password complexity rule (uppercase, lowercase, number, special char). | `auth.service.ts`, `register.dto.ts` |
| **A08: Software & Data Integrity** | Medium | Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strictly blocks mass assignment (e.g. role injection). | `test/auth.e2e-spec.ts` |
| **A09: Logging & Monitoring Failures** | Medium | `HttpExceptionFilter` logs internal errors on server but strips stack traces from all client HTTP responses in production and development. | `http-exception.filter.ts` |
| **A10: Server-Side Request Forgery** | Low | Application does not fetch external URLs or permit user-supplied outbound endpoints. | Architecture review |

---

## 8. Dependency Audit Summary (`npm audit`)

- **Backend:** 27 advisories detected in transitive build-time devDependencies (`@nestjs/cli`, `webpack`, `tar` via `@mapbox/node-pre-gyp`). Zero runtime remote code execution vulnerabilities present in production serving path.
- **Frontend:** 11 advisories detected in dev-time build dependencies (`vitest`, `esbuild`, `tinypool`).
- **Recommendation:** Keep dependencies patched across quarterly maintenance cycles; upgrade to NestJS 12 once officially released out of alpha.
