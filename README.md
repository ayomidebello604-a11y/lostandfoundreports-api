# Lost and Found Reports API

A REST API for registering users, logging in, and managing lost and found item reports. The project is built with Express 5, TypeScript, Zod, PostgreSQL, and JWT-based authentication.

## Features

- User registration and login
- Protected report routes with bearer-token authentication
- CRUD operations for lost and found reports
- Search by item name and paginated listing
- Validation using Zod schemas

## Requirements

- Node.js 18 or later
- npm
- PostgreSQL

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/ayomidebello604-a11y/lostandfoundreports-api.git
   cd lostandfoundreports-api
   npm install
   ```

2. Create a `.env` file in the project root with your PostgreSQL and JWT settings:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=lostandfound
   JWT_SECRET=your_super_secret_key
   ```

   Keep this file private; `.env` is excluded from version control.

3. Create the required PostgreSQL tables for the app.

   ```sql
   CREATE TABLE users (
     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     name VARCHAR(30) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash TEXT NOT NULL
   );

   CREATE TABLE lost_found_reports (
     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     student_id VARCHAR(20) NOT NULL,
     item_name VARCHAR(150) NOT NULL,
     description TEXT NOT NULL,
     type VARCHAR(5) NOT NULL CHECK (type IN ('lost', 'found')),
     category VARCHAR(50) NOT NULL,
     location VARCHAR(150) NOT NULL,
     status VARCHAR(10) NOT NULL DEFAULT 'open'
       CHECK (status IN ('open', 'claimed', 'returned', 'closed')),
     contact_details VARCHAR(150)
   );
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The API listens on `http://localhost:3000`.

5. To build and run the production server:

   ```bash
   npm run build
   npm start
   ```

## Authentication

The project exposes user authentication endpoints under `/api/user`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/user/register` | Register a new user |
| `POST` | `/api/user/login` | Log in and receive a JWT |
| `GET` | `/api/user` | View all users (requires a valid token) |

### Register a user

`POST /api/user/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

### Log in

`POST /api/user/login`

```json
{
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

A successful login returns a user object and a JWT in the `Token` field.
Use the token in the `Authorization` header for protected routes:

```http
Authorization: Bearer <token>
```

## Reports API

All report routes are prefixed with `/api/reports` and require a valid bearer token.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/reports` | Create a report |
| `GET` | `/api/reports` | List all reports, ordered by ID |
| `GET` | `/api/reports/lost` | List lost-item reports |
| `GET` | `/api/reports/found` | List found-item reports |
| `GET` | `/api/reports/search?searchName=...` | Search item names (case-insensitive substring match) |
| `GET` | `/api/reports/paginated?page=1&limit=10` | List a page of reports |
| `GET` | `/api/reports/:id` | Fetch a report by ID |
| `PUT` | `/api/reports/:id` | Update a report's editable fields |
| `DELETE` | `/api/reports/:id` | Delete a report |

### Create a report

`POST /api/reports`

```json
{
  "student_id": "student-123",
  "item_name": "Blue backpack",
  "description": "A blue backpack left near the library.",
  "type": "lost",
  "category": "Bags",
  "location": "Library",
  "contact_details": "student@example.com"
}
```

Field rules:

- `student_id`: max 20 characters
- `item_name`: max 150 characters
- `category`: max 50 characters
- `location`: max 150 characters
- `contact_details`: optional, max 150 characters
- `description`: required text, no maximum length configured
- `type`: must be `lost` or `found`
- `status`: defaults to `open` when omitted

### Search and pagination

Search with a non-empty `searchName` query parameter:

```http
GET /api/reports/search?searchName=backpack
```

Pagination requires both `page` and `limit`:

```http
GET /api/reports/paginated?page=1&limit=10
```

Rules:

- `page` must be at least `1`
- `limit` must be between `1` and `100`
- the paginated response includes `Message`, `page`, `totalPages`, `Limit`, `TotalReport`, and `Reports`

### Updating and deleting

`PUT /api/reports/:id` accepts report fields such as `student_id`, `item_name`, `description`, `type`, `category`, `location`, and optionally `contact_details`.

`DELETE /api/reports/:id` removes the report and returns the deleted record.

## Error handling

The API responds with JSON `message` fields for errors. Common responses include:

- `400 Bad Request`: invalid JSON or invalid request payloads
- `401 Unauthorized`: missing or invalid JWT
- `404 Not Found`: missing report or route
- `500 Internal Server Error`: unexpected server error

Unmatched routes return a JSON response with `message` and `requestedURL`.
