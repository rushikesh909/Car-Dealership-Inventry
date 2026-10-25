# Car Dealership Inventory System

A full-stack web application for managing car dealership inventory, built with NestJS, MongoDB, Prisma, React, and Tailwind CSS following Test-Driven Development (TDD).

---



## Project Overview

This system provides a full car dealership inventory management platform with role-based access control (`USER` and `ADMIN`).

### Core Features

- **Authentication:** Token-based JWT authentication (`POST /api/auth/register`, `POST /api/auth/login`). Passwords hashed with bcrypt.
- **Role-Based Access Control:**
  - `USER`: Browse inventory, filter/search cars, and purchase in-stock vehicles.
  - `ADMIN`: Add new vehicles, update details, delete vehicles, and restock quantities.
- **Race-Safe Purchases:** Purchases atomically decrement vehicle stock at the database level (`quantity > 0`). When a car reaches 0 stock, further purchase attempts return a `409 Conflict`, ensuring inventory is never oversold.
- **Search & Filtering:** Case-insensitive search by make, model, category, and min/max price range with range validation (`minPrice <= maxPrice`).
- **Responsive UI:** Built with React 18, Vite, and Tailwind CSS. Features dynamic modals, debounced search, responsive grid cards, disabled purchase buttons for out-of-stock items, and toast alerts.

---

## Tech Stack

- **Backend:** Node.js (v20+), NestJS, TypeScript, Prisma ORM, MongoDB (with single-node replica set for atomic operations).
- **Security:** Helmet, CORS allow-listing, NestJS Throttler (stricter 5 req/min on auth), global ValidationPipe (whitelist + forbidNonWhitelisted).
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Hook Form, Axios, Lucide Icons.
- **Testing:** Jest + Supertest (Backend unit & E2E integration), Vitest + React Testing Library (Frontend).

---

## Local Setup & Getting Started

### Prerequisites

- Node.js (v20 or higher) and npm (v10 or higher)
- MongoDB (v7.0+ or v9.0 running locally or via Docker)

---

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/rushi/car-dealership-inventory.git
cd car-dealership-inventory

# Create local env files from examples
cp .env.example .env
cp .env.example backend/.env
cp .env.example backend/.env.test
```

---

### Step 2: Start MongoDB

#### Option A: Using Docker Compose
```bash
docker-compose up -d mongodb
```

#### Option B: Local MongoDB (Installed on Windows)
Start MongoDB with replica set enabled (needed by Prisma for transactions and atomicity):
```powershell
mongod --port 27017 --dbpath <path_to_data_dir> --replSet rs0
```
Then initiate the replica set (only needed once):
```powershell
node -e "const { MongoClient } = require('mongodb'); const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true'); client.connect().then(() => client.db('admin').command({ replSetInitiate: {} })).then(r => console.log('ReplSet ready')).catch(e => console.log(e.message)).finally(() => client.close());"
```

---

### Step 3: Run the Backend

```bash
cd backend
npm install

# Push schema to MongoDB and seed admin user
npx prisma db push
npm run seed

# Start development server
npm run start:dev
```

- **Backend API:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

**Default Admin Credentials (from seed):**
- **Email:** `admin@cardealership.com`
- **Password:** `AdminSecurePassword123!`

---

### Step 4: Run the Frontend

In a separate terminal:

```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

- **Frontend App:** `http://localhost:5173`

---

## API Endpoints

All endpoints are prefixed with `/api`. Interactive documentation is available at `http://localhost:3000/api/docs`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (defaults to `USER` role) |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns JWT |
| `POST` | `/api/vehicles` | Authenticated | Create a new vehicle record |
| `GET` | `/api/vehicles` | Authenticated | List all vehicles with pagination (`page`, `limit`) |
| `GET` | `/api/vehicles/search`| Authenticated | Search vehicles (make, model, category, price range) |
| `GET` | `/api/vehicles/:id` | Authenticated | Get vehicle by ID |
| `PUT` | `/api/vehicles/:id` | Authenticated | Update vehicle details |
| `DELETE`| `/api/vehicles/:id`| Admin only | Delete vehicle (returns 204) |
| `POST` | `/api/vehicles/:id/purchase` | Authenticated | Atomically decrements quantity by 1 (409 if 0 stock) |
| `POST` | `/api/vehicles/:id/restock` | Admin only | Restock vehicle by specified positive amount |

---

## Testing & Quality Assurance

### Running Backend Tests

In the `backend/` directory:

```bash
# Run unit tests with code coverage
npm run test:cov



# Run live HTTP smoke test (exercises all 18 endpoints against running server)
npx ts-node scripts/smoke-test.ts
```

### Running Frontend Tests

In the `frontend/` directory:

```bash
# Run Vitest component tests
npm run test:run
```

---

## Test Results Summary

All tests are verified and passing:

- **Backend Unit Tests:** 11 suites, 56 tests passing.
- **Backend Code Coverage:** **95.21% statement coverage** (target was $\ge 90\%$).
- **Backend E2E Tests:** 4 suites, 29 tests passing.
  - `auth.e2e-spec.ts`: Registration, duplicates, password hashing, and login failures.
  - `vehicles.e2e-spec.ts`: Pagination, route precedence (`/search` before `/:id`), CRUD, and 404s.
  - `inventory.e2e-spec.ts`: Purchases, zero-stock 409 conflict, admin restock, and RBAC 403s.
  - `concurrency.e2e-spec.ts`: 10 parallel purchase requests against 3 items; exactly 3 succeed, 7 fail with 409, and inventory never drops below 0.
- **HTTP Smoke Test:** 18/18 scenarios passing against live server.
- **Frontend Tests:** 3 suites, 8 tests passing (form validation, search bar debouncing, vehicle card buttons, admin visibility).

---

## Screenshots

Screenshots of the application in action can be captured and saved in the [`screenshots/`](screenshots/) directory:

1. `01-login-page.png`: Login screen with validation and responsive card.
2. `02-register-page.png`: Register screen with password validation.
3. `03-dashboard-user.png`: Vehicle grid as a standard user with active and disabled purchase buttons.
4. `04-dashboard-admin.png`: Admin view displaying "Add Vehicle", "Edit", "Delete", and "Restock" buttons.
5. `05-search-and-filter.png`: Filtering by make, model, category, and price range.
6. `06-purchase-success-toast.png`: Successful purchase with toast notification and decremented quantity.
7. `07-restock-modal.png`: Admin restock modal increasing inventory.

---

## My AI Usage

### Tools Used
- **Antigravity / Claude 3.7 Sonnet:** Used as an AI pair programmer for scaffolding, TDD test suite design, and debugging.
- **GitHub Copilot / CLI:** Used for syntax assistance and test runner scripting.

### How AI Was Used
1. **Test-Driven Development:** We followed strict Red-Green-Refactor cycles. I had the AI write failing unit and integration tests first (verifying 400, 401, 403, 404, 409 status codes), then implemented the minimal controller and service code to make them pass.
2. **Concurrency Verification:** I used AI to design the concurrency test (`concurrency.e2e-spec.ts`), firing concurrent purchase requests with `Promise.all` to verify that our atomic update (`quantity: { decrement: 1 }` where `quantity > 0`) prevented overselling.
3. **Database Migration:** When switching from PostgreSQL to MongoDB, AI helped update the Prisma schema and verify collection-level cleanup in test helpers.

### Reflection on Workflow Impact
Pair programming with AI significantly sped up writing repetitive boilerplate (DTOs, guards, mock repository setups) and helped ensure no edge cases were missed in validation. However, careful human oversight was essential for making real architectural decisions—such as setting up the MongoDB replica set for transaction support, verifying route order (`/search` declared before `/:id`), and ensuring secrets remained strictly in `.env`.
