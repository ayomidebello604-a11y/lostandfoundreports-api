# 🏛️ Lost & Found Reports API

[![Node.js Version](https://img.shields.io/badge/Node.js-v24%2B-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5.x-000000?logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5%2B-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql)](https://www.postgresql.org)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-6BA539?logo=openapi-initiative)](https://swagger.io/specification/)
[![Tested with Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?logo=vitest)](https://vitest.dev)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A production-grade, secure RESTful API engineered for institutional lost-and-found operations. Built with **Express 5**, **TypeScript**, **PostgreSQL**, and **Zod**, featuring enterprise authentication with rotating refresh tokens, granular Role-Based Access Control (RBAC), strict row-level authorization, and comprehensive **OpenAPI 3.0 / Swagger UI** documentation.

---

## 📑 Table of Contents

- [Key Architecture & Security Features](#-key-architecture--security-features)
- [System Architecture & Auth Flow](#-system-architecture--auth-flow)
- [Interactive API Documentation (Swagger UI)](#-interactive-api-documentation-swagger-ui)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites & Requirements](#-prerequisites--requirements)
- [Environment Configuration](#-environment-configuration)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
  - [Authentication & Session Endpoints (`/api/user`)](#authentication--session-endpoints-apiuser)
  - [Reports Management Endpoints (`/api/reports`)](#reports-management-endpoints-apireports)
- [Error Handling Strategy](#-error-handling-strategy)
- [Testing Suite](#-testing-suite)
- [License](#-license)

---

## 🛡️ Key Architecture & Security Features

- **Double-Token Authentication Architecture**: Short-lived access JWTs paired with long-lived (48-hour) cryptographically random refresh tokens.
- **Atomic Refresh Token Rotation (RTR)**: Every refresh operation is wrapped inside a PostgreSQL ACID transaction using pessimistic locking (`SELECT ... FOR UPDATE`), immediately revoking the predecessor to defend against replay and concurrency attacks.
- **Hashed Token Storage**: Refresh tokens are never persisted in plaintext; SHA-256 digests are stored and compared, ensuring session safety even during database compromises.
- **Modern Cryptography**: Password storage powered by **Argon2id**, the winner of the Password Hashing Competition (PHC).
- **Two-Tier Authorization (RBAC + Ownership)**: Route middleware validates roles (`student`, `admin`), while repository queries enforce row-level ownership (`WHERE user_id = $n`) for mutative actions by students.
- **End-to-End Type Safety & Runtime Validation**: Validated via strict **Zod** schemas at request boundaries before reaching controllers.
- **Interactive OpenAPI 3.0 Documentation**: Integrated Swagger UI documentation mounted at `/api-docs` generated dynamically from JSDoc specifications.
- **Fail-Fast Error Handling**: Structured, standardized error contracts using a custom `AppError` domain model.

---

## 🔄 System Architecture & Auth Flow

```
[ Client ] 
   │
   ├── (1) POST /api/user/login ───────────► [ Argon2 Verification ]
   │                                                    │
   ◄── (2) Returns Access JWT + Plain Refresh Token ────┘
   │
   ├── (3) Protected Request (Bearer JWT) ──► [ verifyUserToken Middleware ]
   │                                                    │
   │                                          (Validates Signature & Expiry)
   │                                                    ▼
   │                                          [ Controller / Repository ]
   │
   └── (4) POST /api/user/refresh ────────► [ ACID Transaction: BEGIN ]
                                                        │
                                            (Pessimistic Lock: FOR UPDATE)
                                            (Revoke Old Token: revoked_at=NOW())
                                            (Mint & Insert New SHA-256 Hash)
                                                        ▼
   ◄── (5) Returns New AT + Rotated RT ──── [ COMMIT ]
```

---

## 📖 Interactive API Documentation (Swagger UI)

This API includes integrated OpenAPI 3.0.3 documentation rendered with **Swagger UI**.

- **Swagger UI Dashboard**: `http://localhost:3000/api-docs`
- **Config & Schemas**: Located in [`src/config/swagger.ts`](src/config/swagger.ts), [`src/docs/auth.docs.ts`](src/docs/auth.docs.ts), and [`src/docs/reports.docs.ts`](src/docs/reports.docs.ts).
- Explore endpoints, review request/response schemas, inspect status codes, and test authenticated requests directly via the interactive UI using Bearer JWT authorization.

---

## 📂 Project Directory Structure

```
lostandfound-api/
├── src/
│   ├── config/                 # Swagger JSDoc & OpenAPI specification options
│   │   └── swagger.ts
│   ├── controllers/            # HTTP request orchestrators & response handlers
│   │   ├── auth.controllers.ts
│   │   └── lostfound.controller.ts
│   ├── db/                     # PostgreSQL pg.Pool lifecycle management
│   │   └── index.ts
│   ├── docs/                   # OpenAPI / Swagger JSDoc annotations
│   │   ├── auth.docs.ts
│   │   └── reports.docs.ts
│   ├── errors/                 # Centralized AppError abstractions
│   │   └── AppError.ts
│   ├── middleware/             # Validation and JWT/RBAC security guards
│   │   ├── auth.validation.ts
│   │   └── lostfound.validation.ts
│   ├── repositories/           # PostgreSQL data-access layer & transactional queries
│   │   ├── auth.repositories.ts
│   │   └── lostfound.repositories.ts
│   ├── routes/                 # Express route definitions
│   │   ├── auth.routes.ts
│   │   └── lostfound.routes.ts
│   ├── schema/                 # Zod runtime schemas & inference types
│   │   ├── auth.schema.ts
│   │   └── lostandfound.schema.ts
│   ├── services/               # Core business logic & domain rules
│   │   ├── auth.services.ts
│   │   └── lostfound.services.ts
│   ├── tests/                  # Unit and integration test suites
│   │   ├── auth.services.test.ts
│   │   └── app.test.ts
│   ├── types/                  # Ambient and TypeScript contract definitions
│   │   ├── express.d.ts
│   │   ├── lostfoundvalidation.types.ts
│   │   └── reports.types.ts
│   ├── utils/                  # Cryptography, JWT (jose), and utility helpers
│   │   └── jwt.ts
│   ├── app.ts                  # Express application setup & middleware assembly
│   ├── password.ts             # Argon2 password hashing routines
│   └── server.ts               # HTTP server bootstrap & port binding
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Prerequisites & Requirements

- **Node.js**: `v24.0.0` or higher (ESM native)
- **PostgreSQL**: `v15.0` or higher
- **Package Manager**: `npm`

---

## 🔐 Environment Configuration

Create a `.env` file in the root directory:

```ini
# Application Secrets
JWT_SECRET=your_super_strong_jwt_signing_secret_min_32_chars

# Database Credentials
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_database_password
DB_NAME=lostandfound
```

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `JWT_SECRET` | Secret key used to sign and verify HMAC HS256 tokens | Yes | `c47f9...` |
| `DB_HOST` | Hostname/IP address of the PostgreSQL server | Yes | `127.0.0.1` |
| `DB_PORT` | Port exposed by PostgreSQL | Yes | `5432` |
| `DB_USER` | PostgreSQL user account | Yes | `postgres` |
| `DB_PASSWORD`| PostgreSQL password | Yes | `secret123` |
| `DB_NAME` | Target database catalog | Yes | `lostandfound` |

---

## 🗄️ Database Schema & Migrations

Execute the following DDL statements to provision your schema:

```sql
-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Rotating Refresh Tokens Table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

-- 3. Lost & Found Reports Table
CREATE TABLE lost_found_reports (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  student_id VARCHAR(20) NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(5) NOT NULL CHECK (type IN ('lost', 'found')),
  category VARCHAR(50) NOT NULL,
  location VARCHAR(150) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'returned', 'closed')),
  contact_details VARCHAR(150)
);

CREATE INDEX idx_reports_item_name ON lost_found_reports (item_name);
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/ayomidebello604-a11y/lostandfoundreports-api.git
cd lostandfoundreports-api
npm install
```

### 2. Development Mode
Launches the server with live file watching via `tsx watch`:
```bash
npm run dev
```
The server will start at `http://localhost:3000`.  
Swagger UI is available at `http://localhost:3000/api-docs`.

### 3. Production Build & Execution
Compiles TypeScript via `tsc` and runs the compiled bundle:
```bash
npm run build
npm start
```

---

## 📡 API Reference

### Authentication & Session Endpoints (`/api/user`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/user/register` | None | Register a student account |
| `POST` | `/api/user/login` | None | Authenticate credentials and receive token pair |
| `POST` | `/api/user/refresh` | None | Rotate refresh token and obtain fresh access token |
| `POST` | `/api/user/logout` | None | Revoke the active refresh token session |
| `GET` | `/api/user` | Bearer | Retrieve catalog of registered users |

<details>
<summary><strong>View Auth Payloads & Responses</strong></summary>

#### Register User
`POST /api/user/register`
```json
// Request
{
  "name": "Alex Mercer",
  "email": "alex@university.edu",
  "password": "SecurePassword123!"
}

// Response (201 Created)
{
  "message": "User Created",
  "user": {
    "name": "Alex Mercer",
    "email": "alex@university.edu"
  }
}
```

#### Login
`POST /api/user/login`
```json
// Request
{
  "email": "alex@university.edu",
  "password": "SecurePassword123!"
}

// Response (200 OK)
{
  "message": "User Authenticated",
  "user": {
    "user_id": "07ee00cf-f485-4e01-8e1c-67c955f46ff8",
    "email": "alex@university.edu",
    "name": "Alex Mercer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "7c9e012d...",
    "expires_at": "2026-10-30T15:00:00.000Z"
  }
}
```

#### Token Rotation
`POST /api/user/refresh`
```json
// Request
{
  "refreshToken": "7c9e012d..."
}

// Response (200 OK)
{
  "message": "Token successfully rotated",
  "newTokens": {
    "sessionId": "4f183785-5b4d-457c-86bc-5ca3b811776f",
    "new_accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "9d1b02...",
    "expiresAt": "2026-10-30T15:00:00.000Z"
  }
}
```

#### Logout
`POST /api/user/logout`
```json
// Request
{
  "refreshToken": "7c9e012d..."
}

// Response (200 OK)
{
  "Message": "User Logged out",
  "status": true
}
```

#### Get All Users
`GET /api/user`
```json
// Response (200 OK)
{
  "message": "All Users",
  "users": [
    {
      "id": "07ee00cf-f485-4e01-8e1c-67c955f46ff8",
      "name": "Alex Mercer",
      "email": "alex@university.edu"
    }
  ]
}
```
</details>

---

### Reports Management Endpoints (`/api/reports`)

> 🔒 **All report endpoints require a Bearer Access Token**:  
> `Authorization: Bearer <accessToken>`

| Method | Endpoint | Roles | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/reports` | `student`, `admin` | File a new lost/found report |
| `GET` | `/api/reports` | `student`, `admin` | Fetch all reports (ascending order) |
| `GET` | `/api/reports/lost` | `student`, `admin` | Filter reports where `type = 'lost'` |
| `GET` | `/api/reports/found` | `student`, `admin` | Filter reports where `type = 'found'` |
| `GET` | `/api/reports/search` | `student`, `admin` | Case-insensitive substring search (`?searchName=...`) |
| `GET` | `/api/reports/paginated` | `student`, `admin` | Paginated listings (`?page=1&limit=10`) |
| `GET` | `/api/reports/:id` | `student`, `admin` | Retrieve a specific report by ID |
| `PUT` | `/api/reports/:id` | `student`, `admin` | Update a report (Owner only) |
| `DELETE` | `/api/reports/:id` | `student`, `admin` | Delete report (Student = own only; Admin = any) |

<details>
<summary><strong>View Report Payloads & Examples</strong></summary>

#### Create Report
`POST /api/reports`
```json
// Request
{
  "student_id": "STU-8821",
  "item_name": "Calculus Textbook (Stewart 9th Ed.)",
  "description": "Hardcover book with blue markings left on bench 4.",
  "type": "lost",
  "category": "Books",
  "location": "Science Quad",
  "contact_details": "alex@university.edu"
}

// Response (201 Created)
{
  "id": 42,
  "user_id": "07ee00cf-f485-4e01-8e1c-67c955f46ff8",
  "student_id": "STU-8821",
  "item_name": "Calculus Textbook (Stewart 9th Ed.)",
  "description": "Hardcover book with blue markings left on bench 4.",
  "type": "lost",
  "category": "Books",
  "location": "Science Quad",
  "status": "open",
  "contact_details": "alex@university.edu"
}
```

#### Paginated Reports
`GET /api/reports/paginated?page=1&limit=10`
```json
// Response (200 OK)
{
  "Message": "Paginated Reports Fetched",
  "page": 1,
  "totalPages": 4,
  "Limit": 10,
  "TotalReport": 38,
  "Reports": [ /* Array of Report Objects */ ]
}
```
</details>

---

## 🚦 Error Handling Strategy

The API enforces uniform, RFC-compliant JSON error bodies:

```json
{
  "message": "Specific explanation of the failure"
}
```

| HTTP Status | Context |
| :--- | :--- |
| `400 Bad Request` | Zod validation violation, malformed JSON body, or illegal URL parameter |
| `401 Unauthorized` | Missing token, malformed signature, or expired session |
| `403 Forbidden` | Authenticated user lacks permission / unauthorized action |
| `404 Not Found` | Requested report ID does not exist or unmapped route |
| `500 Internal Error` | Unhandled runtime exception or connection failure |

---

## 🧪 Testing Suite

Testing is built with **Vitest** and **Supertest** across two distinct layers:

```bash
# Run test suite in watch mode
npm test

# Run test suite once (CI / single run)
npx vitest run src/tests
```

- **Unit Testing (`src/tests/auth.services.test.ts`)**: Tests covering `logoutService` and `verifyTokenService` with repository and JWT mocks.
- **Integration Testing (`src/tests/app.test.ts`)**: Full-lifecycle HTTP testing through Express routes against live PostgreSQL storage. Includes automatic cleanup hooks ensuring database isolation between test cycles.

---

## 📄 License

This software is released under the **ISC License**.
