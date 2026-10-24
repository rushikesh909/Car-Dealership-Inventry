# Car Dealership Inventory System

[![CI Pipeline](https://github.com/rushi/car-dealership-inventory/actions/workflows/ci.yml/badge.svg)](https://github.com/rushi/car-dealership-inventory/actions/workflows/ci.yml)
[![Backend Test Coverage](https://img.shields.io/badge/Coverage-95.19%25-brightgreen.svg)](#test-coverage-summary)
[![Node Version](https://img.shields.io/badge/Node.js-20%2B-blue.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

A production-quality, full-stack vehicle inventory and sales management platform built adhering to a real Software Development Life Cycle (SDLC) and strict Test-Driven Development (TDD: RED -> GREEN -> REFACTOR).

---

## Live Demo & Deployment

- **Live Application URL:** `[LIVE_DEMO_LINK_PLACEHOLDER]` *(e.g., https://car-inventory.vercel.app)*
- **Live Backend API & Swagger:** `[LIVE_API_DOCS_PLACEHOLDER]` *(e.g., https://car-inventory-api.onrender.com/api/docs)*

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Technology Choices & Justification](#technology-choices--justification)
3. [Token Storage Decision: localStorage vs httpOnly Cookie](#token-storage-decision-localstorage-vs-httponly-cookie)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Local Setup](#step-by-step-local-setup)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Native Setup (Local Node & PostgreSQL)](#option-b-native-setup-local-node--postgresql)
6. [API Specification & Endpoints](#api-specification--endpoints)
7. [Testing & Verification](#testing--verification)
   - [Running Backend Tests](#running-backend-tests)
   - [Running Frontend Tests](#running-frontend-tests)
   - [Concurrency & Race-Safety Verification](#concurrency--race-safety-verification)
   - [Automated HTTP Smoke Test](#automated-http-smoke-test)
8. [Test Coverage Summary](#test-coverage-summary)
9. [Screenshots Guide](#screenshots-guide)
10. [My AI Usage & Reflection](#my-ai-usage--reflection)
11. [Maintenance Notes & Known Limitations](#maintenance-notes--known-limitations)

---

## Architectural Overview

The backend is built following strict **SOLID** principles, NestJS Modular Domain-Driven architecture, and Dependency Inversion:

- **Layered Decoupling:** `Controller (HTTP Protocol)` -> `Service (Domain Business Logic)` -> `Repository (Data Access Abstraction)` -> `Prisma ORM` -> `MongoDB`.
- **Atomic Concurrency Protection:** Race-safe single conditional document updates ensure parallel purchase transactions cannot oversell stock or drop inventory below zero (`quantity: { decrement: 1 } WHERE quantity > 0`).
- **Route Ordering:** Search route `@Get('search')` is defined ahead of `@Get(':id')` to prevent parameter collision and route masking.
- **Defensive Error Sanitization:** Global `HttpExceptionFilter` intercepts all runtime errors, strips raw database error messages and stack traces from HTTP responses, and formats a consistent payload shape:
  ```json
  {
    "statusCode": 400,
    "timestamp": "2026-10-24T00:00:00.000Z",
    "path": "/api/vehicles",
    "message": "Validation failed",
    "error": "Bad Request"
  }
  ```

---

## Technology Choices & Justification

| Layer / Concern | Technology | Justification |
| :--- | :--- | :--- |
| **Backend Framework** | NestJS + TypeScript | Enterprise-grade structure, inversion of control (DI), first-class support for validation pipes, guards, interceptors, and Swagger OpenAPI. |
| **Database & ORM** | MongoDB + Prisma ORM | Real document database engine with native document-level atomicity, type-safe query generation via Prisma, flexible schema indexing, and race-safe conditional updates (`$inc`). In-memory databases were strictly rejected. |
| **Authentication** | JWT (`@nestjs/jwt` + `passport-jwt`) | Stateless authentication with claims (`sub`, `email`, `role`). Expiry enforced and configurable via environment variables. |
| **Password Security** | `bcrypt` (10 salt rounds) | Adaptive cryptographic hashing resistant to GPU brute-force attacks. Password hashes are excluded from all DTO responses. |
| **API Security** | `helmet`, `cors`, `@nestjs/throttler` | Hardened HTTP response headers, explicit domain CORS allow-listing, and tiered rate-limiting (stricter 5 req/min on `/api/auth` to prevent brute-force attacks). |
| **Frontend Framework** | React 18 + Vite + TypeScript | Lightning-fast Hot Module Replacement (HMR), static typing, optimized tree-shaken production bundles. |
| **Styling & UI** | Tailwind CSS | Utility-first CSS, mobile-first responsive grid layouts, accessible focus states, and bespoke loading skeletons. |
| **Form Handling** | React Hook Form | High-performance uncontrolled form inputs, minimal re-renders, and synchronous schema-based field validation. |
| **Client HTTP** | Axios + Interceptors | Centralized JWT attachment on every outbound request, automatic response transformation, and centralized `401 Unauthorized` redirect handling. |
| **Testing** | Jest + Supertest (Backend), Vitest + RTL (Frontend) | Real PostgreSQL E2E testing with database isolation, concurrent stress tests, and isolated component interaction testing. |

---

## Token Storage Decision: localStorage vs httpOnly Cookie

In modern Single Page Application (SPA) architectures, client token storage presents a well-known architectural trade-off:

### The Trade-off

1. **`httpOnly` Cookies:**
   - *Pros:* Immune to client-side token theft via Cross-Site Scripting (XSS) because JavaScript cannot access `document.cookie`.
   - *Cons:* Vulnerable to Cross-Site Request Forgery (CSRF), requiring additional anti-CSRF tokens (`SameSite=Strict`, custom request headers, or CSRF tokens). Complex to configure across decoupled domains (e.g. frontend on `vercel.app` and backend on `railway.app`), and less intuitive for mobile or non-browser clients.
2. **`localStorage`:**
   - *Pros:* Standard for decoupled stateless REST APIs. Tokens are transmitted explicitly via the `Authorization: Bearer <token>` header, making the API completely immune to CSRF attacks. Works uniformly across web browsers, mobile apps, and automated test runners.
   - *Cons:* If malicious JavaScript executes on the page (XSS), the token stored in `localStorage` can be read.

### Architectural Choice & Justification

**Chosen Solution:** `localStorage` combined with strict **Defense-in-Depth against XSS**.

- **Why:** The system uses standard OAuth2 / JWT Bearer authorization across decoupled frontend and backend services. This eliminates the entire class of CSRF vulnerabilities by design.
- **Mitigating the XSS Risk:**
  1. React natively sanitizes and escapes all strings embedded in JSX, preventing raw HTML / script injection.
  2. The backend implements `helmet` with strict Content Security Policy (CSP), frameguarding (`X-Frame-Options: SAMEORIGIN`), and MIME-sniffing prevention (`X-Content-Type-Options: nosniff`).
  3. Strict input validation pipes (`class-validator`) reject unexpected characters and mass assignment payloads before they reach persistent storage.

---

## Prerequisites

- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Docker & Docker Compose:** Required for containerized MongoDB service (or local MongoDB 7.0+ / 9.0 instance configured with a replica set).

---

## Step-by-Step Local Setup

### Option A: Docker Compose (Recommended)

1. **Clone repository:**
   ```bash
   git clone https://github.com/rushi/car-dealership-inventory.git
   cd car-dealership-inventory
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```

3. **Start MongoDB database:**
   ```bash
   docker-compose up -d mongodb
   ```

4. **Install backend dependencies, push schema, and seed:**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run seed
   npm run start:dev
   ```
   *The backend will start at `http://localhost:3000/api` with Swagger UI at `http://localhost:3000/api/docs`.*

5. **Start frontend in a new terminal:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will open at `http://localhost:5173`.*

---

### Option B: Native Setup (Local Node & MongoDB)

1. **Provision MongoDB instance:**
   Ensure MongoDB 7.0+ or 9.0 is running locally with replica set enabled (e.g. `mongod --port 27017 --dbpath <data_dir> --replSet rs0`). Run `rs.initiate()` if starting a new replica set.
2. **Configure `.env`:**
   Adjust `DATABASE_URL` and `TEST_DATABASE_URL` in `backend/.env` and `backend/.env.test` (`mongodb://127.0.0.1:27017/cardealership?replicaSet=rs0&directConnection=true`).
3. **Execute schema push & seed:**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run seed
   ```
4. **Run applications:**
   ```bash
   # Terminal 1: Backend
   npm run start:dev

   # Terminal 2: Frontend
   cd ../frontend
   npm install
   npm run dev
   ```

---

## API Specification & Endpoints

All endpoints are prefixed with `/api`. Interactive documentation is available via Swagger at `http://localhost:3000/api/docs`.

| Method | Endpoint | Access / Role | Success | Error Codes | Description |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | Public | `201` | `400, 409` | Register user (`email`, `password`). Always assigns `USER` role. |
| `POST` | `/api/auth/login` | Public | `200` | `400, 401` | Authenticate user. Returns `{ accessToken }`. |
| `POST` | `/api/vehicles` | Authenticated | `201` | `400, 401` | Add vehicle (`make`, `model`, `category`, `price`, `quantity`). |
| `GET` | `/api/vehicles` | Authenticated | `200` | `401` | Retrieve paginated vehicle list (`page`, `limit`). |
| `GET` | `/api/vehicles/search` | Authenticated | `200` | `400, 401` | Filter vehicles (`make`, `model`, `category`, `minPrice`, `maxPrice`). |
| `GET` | `/api/vehicles/:id` | Authenticated | `200` | `401, 404` | Retrieve single vehicle details by UUID. |
| `PUT` | `/api/vehicles/:id` | Authenticated | `200` | `400, 401, 404`| Partial update of vehicle details. |
| `DELETE`| `/api/vehicles/:id` | ADMIN Only | `204` | `401, 403, 404`| Delete vehicle from inventory. |
| `POST` | `/api/vehicles/:id/purchase` | Authenticated | `200` | `401, 404, 409`| Atomically decrement quantity by 1. 409 when out of stock. |
| `POST` | `/api/vehicles/:id/restock` | ADMIN Only | `200` | `400, 401, 403, 404`| Increment vehicle stock by `{ amount }` (positive integer). |

---

## Testing & Verification

### Running Backend Tests

```bash
cd backend

# Run unit tests
npm test

# Run unit tests with coverage report (target >= 90%)
npm run test:cov

# Run E2E integration tests against PostgreSQL test database
npm run test:e2e
```

### Running Frontend Tests

```bash
cd frontend

# Run Vitest component tests (Forms, VehicleCard, SearchBar)
npm run test:run

# Run Vitest in watch mode
npm run test
```

### Concurrency & Race-Safety Verification

The concurrency test verifies that parallel purchases cannot cause negative inventory overselling.
- **Location:** `backend/test/concurrency.e2e-spec.ts`
- **Execution:** 10 asynchronous concurrent HTTP requests fire against an inventory stock of 3 units.
- **Verified Result:** Exactly 3 requests succeed (200 OK), 7 requests are rejected (409 Conflict), and ending stock is exactly 0.

### Automated HTTP Smoke Test

A complete live end-to-end smoke test script exercises all 18 API scenarios sequentially against a running server:

```bash
cd backend
npx ts-node scripts/smoke-test.ts
```

---

## Test Coverage Summary

Empirical test run outputs from `npm run test:cov` (Backend) and `npm run test:run` (Frontend):

| Component | Statement Coverage | Status |
| :--- | :---: | :---: |
| **All Backend Files** | **95.19%** | **PASS (Exceeds >= 90% Target)** |
| `modules/auth` | 100% | PASS |
| `modules/vehicles` | 100% | PASS |
| `modules/inventory` | 100% | PASS |
| `modules/users` | 100% | PASS |
| `common/guards` | 100% | PASS |
| **Frontend Test Suites** | 8 / 8 tests passed | PASS |
| **E2E Integration Suites**| 29 / 29 tests passed | PASS |
| **Automated Smoke Test** | 18 / 18 tests passed | PASS |

*The full raw logs and breakdown are recorded in [`docs/test-report.md`](docs/test-report.md).*

---

## Screenshots Guide

To capture real, authentic screenshots for your portfolio or grading submission, save the corresponding screen captures to [`docs/screenshots/`](docs/screenshots/README.md):

1. `01-login-screen.png` - Login page showing email and password fields, validation messages, and link to register.
2. `02-dashboard-user-view.png` - Standard `USER` view of vehicle grid cards, showing make, model, price, stock, and "Purchase" buttons.
3. `03-search-and-filtering.png` - Active search bar filtering by make/model and price range with instant grid updates.
4. `04-purchase-and-out-of-stock.png` - Vehicle card at 0 inventory displaying disabled "Out of Stock" button and toast notification.
5. `05-admin-dashboard-controls.png` - Logged in as `ADMIN` showing "Add Vehicle", "Restock", and "Delete" administrative buttons.
6. `06-add-edit-vehicle-modal.png` - Responsive modal for creating or editing vehicle attributes.
7. `07-swagger-api-docs.png` - Interactive Swagger OpenAPI documentation at `/api/docs`.

---

## My AI Usage & Reflection

### Tools Used
- **Antigravity (Pair Programming Agent):** Claude 3.7 Sonnet agentic architecture with direct file and execution tooling.
- **GitHub Copilot / CLI Tooling:** Used for automated test execution, schema validation, and git workflow management.

### How AI Was Used
1. **Requirements & SDLC Documentation:** Synthesized functional and architectural specifications into `docs/requirements.md` and `docs/design.md` with Mermaid diagrams.
2. **Strict Test-Driven Development (TDD):**
   - Implemented separate atomic commits in the order of `test:` (RED) -> `feat:` (GREEN) -> `refactor:`.
   - Formulated comprehensive edge cases: race condition testing, zero-stock collision, route precedence verification, and mass assignment protection.
3. **Database & Infrastructure Provisioning:** Configured dual-database PostgreSQL architecture (app and test isolated databases), automated Prisma migration scripts, and multi-stage Dockerfiles.

### Reflection & Workflow Impact
- **Productivity & Speed:** Scaffolding type-safe NestJS modules with corresponding DTOs, guards, and services was accelerated significantly without cutting corners on test coverage.
- **Architectural Rigor:** AI paired programming forced strict adherence to test-first methodology. Writing failing unit and Supertest integration tests prior to business logic prevented false-positive green tests.
- **Personalized Notes:**  
  *[USER TO PERSONALIZE: Add 2-3 sentences reflecting on your personal experience pairing with AI during this kata, e.g., how reviewing AI-generated concurrency tests helped you understand PostgreSQL conditional row-locking or how Tailwind skeletons improved UX.]*

---

## Maintenance Notes & Known Limitations

1. **Token Invalidation on Password Change / Revocation:**
   - *Current Implementation:* JWTs are stateless and expire after the configured `JWT_EXPIRES_IN` duration (default 1 day).
   - *Next Steps:* Implement a Redis-backed token blacklist or rotating refresh token schema with revoked token tables for instant session invalidation.
2. **Audit Logging for Financial Transactions:**
   - *Current Implementation:* Vehicle purchases atomically decrement inventory quantity directly on the `Vehicle` table.
   - *Next Steps:* Create a dedicated `Transaction` / `Order` table to preserve historical buyer records, timestamped transaction amounts, and receipt IDs.
3. **Multi-Region Database Read Replicas:**
   - *Current Implementation:* Single PostgreSQL primary instance handles both read queries and write updates.
   - *Next Steps:* Configure Prisma read replicas for high-throughput search queries across distributed geographic nodes.
