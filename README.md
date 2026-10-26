# Lost and Found Reports API

A REST API for registering users, authenticating with JWT, and managing lost and found item reports. This project is built with Express 5, TypeScript, PostgreSQL, Zod validation, and secure token-based authentication.

## Overview

This API supports:

- User registration and login
- Access-token authentication with refresh-token rotation
- Secure logout using a refresh token
- CRUD operations for lost and found reports
- Search and pagination for report listings
- Role-based access control for admin-only actions
- Validation and structured error handling

## Tech stack

- Node.js 18+
- Express 5
- TypeScript
- PostgreSQL
- Zod
- JWT via `jose`
- bcrypt-based password hashing

## Requirements

- Node.js 18 or later
- npm
- PostgreSQL database instance

## Project setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ayomidebello604-a11y/lostandfoundreports-api.git
   cd lostandfoundreports-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```dotenv
   JWT_SECRET=your_super_secret_key
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=lostandfound
   ```

   Keep the file private and never commit it to version control.

4. Create the PostgreSQL tables used by the app:

   ```sql
   CREATE TABLE users (
     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     name VARCHAR(30) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     role VARCHAR(10) NOT NULL DEFAULT 'student'
       CHECK (role IN ('student', 'admin'))
   );

   CREATE TABLE refresh_tokens (
     user_id INTEGER NOT NULL REFERENCES users(id),
     session_id UUID NOT NULL,
     token_hash TEXT NOT NULL,
     expires_at TIMESTAMPTZ NOT NULL,
     revoked_at TIMESTAMPTZ
   );

   CREATE TABLE lost_found_reports (
     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     user_id INTEGER NOT NULL REFERENCES users(id),
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

5. Start the server in development mode:

   ```bash
   npm run dev
   ```

   The API runs at `http://localhost:3000`.

6. Build and run in production mode:

   ```bash
   npm run build
   npm start
   ```

## Authentication API

All authentication routes are mounted under `/api/user`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/user` | Retrieve all users. Requires a valid access token. |
| `POST` | `/api/user/register` | Register a new user account. |
| `POST` | `/api/user/login` | Sign in and receive access and refresh tokens. |
| `POST` | `/api/user/refreshToken` | Rotate a refresh token and receive a new access token. |
| `POST` | `/api/user/logout` | Revoke a refresh token and log the user out. |

### Access token usage

After login, include the access token in the `Authorization` header for protected routes:

```http
Authorization: Bearer <accessToken>
```

## Authorization flow

The API uses a two-step authorization flow for protected resources:

1. The client sends a JWT in the `Authorization: Bearer <accessToken>` header.
2. The `verifyUserToken` middleware validates the token using the `JWT_SECRET` value from the environment.
3. If the token is valid, the middleware reads the user ID and role from the JWT payload and attaches them to the request (`req.userId`, `req.userRole`).
4. Protected routes such as `/api/reports` continue to the controller logic only after authentication succeeds.
5. Role-restricted endpoints use `authorizeRoles(...)` to allow or deny access based on the user's role.

### Middleware behavior

- Missing or malformed `Authorization` header -> `401 Unauthorized`
- Expired, invalid, or tampered JWT -> `401 Unauthorized`
- Valid token but insufficient role for the route -> `403 Forbidden`
- Valid token and valid role -> request proceeds normally

### Example protected request

```http
GET /api/reports
Authorization: Bearer <accessToken>
```

This route is protected by `verifyUserToken`, which ensures the caller is authenticated before the report controller runs.

For admin-only actions:

```http
DELETE /api/reports/42
Authorization: Bearer <adminAccessToken>
```

This route uses `authorizeRoles("admin")` in addition to token verification. A non-admin user receives a `403 Forbidden` response.

### Register a user

`POST /api/user/register`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

Successful response:

```json
{
  "message": "User Created",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### Login

`POST /api/user/login`

Request body:

```json
{
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

Successful response:

```json
{
  "message": "User Authenticated",
  "user": {
    "user_id": 1,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<refresh-token>",
    "expires_at": "2026-10-27T10:15:00.000Z"
  }
}
```

Notes:

- Access tokens are short-lived.
- Refresh tokens are long-lived and rotated each time they are used.
- Refresh tokens are stored as a hashed value for security.

### Refresh token rotation

`POST /api/user/refreshToken`

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Successful response:

```json
{
  "message": "Token successfully rotated",
  "newTokens": {
    "sessionId": "d1f6e1f0-0d52-49b1-9a4d-a3a75b4d8ef3",
    "new_accessToken": "<new-access-token>",
    "refreshToken": "<new-refresh-token>",
    "expiresAt": "2026-10-27T10:15:00.000Z"
  }
}
```

This endpoint verifies the submitted refresh token, rotates it, and revokes the previous one.

### Logout

`POST /api/user/logout`

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Successful response:

```json
{
  "Message": "User Logged out",
  "status": true
}
```

## Reports API

Report routes are mounted under `/api/reports` and require a valid access token.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/reports` | Create a report |
| `GET` | `/api/reports` | Retrieve all reports |
| `GET` | `/api/reports/lost` | Retrieve lost-item reports |
| `GET` | `/api/reports/found` | Retrieve found-item reports |
| `GET` | `/api/reports/search?searchName=...` | Search report items by name |
| `GET` | `/api/reports/paginated?page=1&limit=10` | Retrieve paginated results |
| `GET` | `/api/reports/:id` | Fetch a report by ID |
| `PUT` | `/api/reports/:id` | Update an existing report |
| `DELETE` | `/api/reports/:id` | Delete a report. Restricted to admins. |

### Create a report

`POST /api/reports`

Request body:

```json
{
  "student_id": "STU-123",
  "item_name": "Blue backpack",
  "description": "A blue backpack left near the library entrance.",
  "type": "lost",
  "category": "Bags",
  "location": "Library",
  "contact_details": "student@example.com"
}
```

Validation rules:

- `student_id`: required, max 20 characters
- `item_name`: required, max 150 characters
- `description`: required and non-empty
- `type`: must be either `lost` or `found`
- `category`: required, max 50 characters
- `location`: required, max 150 characters
- `contact_details`: optional, max 150 characters
- `status`: defaults to `open` when created
- Each report is associated with the authenticated user who created it

### Fetch reports

#### List all reports

```http
GET /api/reports
```

#### Lost reports

```http
GET /api/reports/lost
```

#### Found reports

```http
GET /api/reports/found
```

#### Search by item name

```http
GET /api/reports/search?searchName=backpack
```

This searches by case-insensitive partial match of `item_name`.

#### Pagination

```http
GET /api/reports/paginated?page=1&limit=10
```

Rules:

- `page` must be at least `1`
- `limit` must be between `1` and `100`
- response contains keys such as `Message`, `page`, `totalPages`, `Limit`, `TotalReport`, and `Reports`

### Get a single report

```http
GET /api/reports/:id
```

### Update a report

`PUT /api/reports/:id`

Example:

```json
{
  "item_name": "Red backpack",
  "location": "Main hall",
  "contact_details": "newemail@example.com"
}
```

Only the owner of the report can update it unless a privileged admin action is required.

### Delete a report

`DELETE /api/reports/:id`

This action is restricted to users with the `admin` role.

## User roles

The system supports two roles:

- `student`: default account role
- `admin`: privileged role used for administrative actions such as deleting reports

To promote a user to admin, update the database entry:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Error handling

The API returns JSON error responses with a `message` field.

Common HTTP responses:

- `400 Bad Request`: invalid request payload or malformed JSON
- `401 Unauthorized`: missing or invalid access token / refresh token
- `403 Forbidden`: user does not have the required role
- `404 Not Found`: resource or route not found
- `500 Internal Server Error`: unexpected server error

Unmatched routes return:

```json
{
  "message": "Route Not Found",
  "requestedURL": "/api/unknown"
}
```

## Security notes

- Passwords are hashed before storage.
- Refresh tokens are hashed and rotated instead of reused.
- Access tokens are validated before protected routes are accessed.
- Admin-only routes enforce authorization checks.

## Example workflow

1. Register a user at `POST /api/user/register`.
2. Log in at `POST /api/user/login` and save the returned `accessToken`.
3. Use the token on `/api/reports` routes via the `Authorization: Bearer ...` header.
4. Rotate tokens when needed with `POST /api/user/refreshToken`.
5. Log out with `POST /api/user/logout` using the refresh token.

## License

This project is for educational and internal API use unless a separate license is added by the repository owner.
