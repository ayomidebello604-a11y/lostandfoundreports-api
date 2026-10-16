# Lost and Found Reports API

A REST API for creating and managing lost and found item reports. It is built
with Express 5, TypeScript, Zod, and PostgreSQL.

## Requirements

- Node.js 18 or later
- npm
- PostgreSQL

## Getting started

1. Clone the repository and install its dependencies:

   ```bash
   git clone https://github.com/ayomidebello604-a11y/lostandfoundreports-api.git
   cd lostandfoundreports-api
   npm install
   ```

2. Create a `.env` file in the project root with your PostgreSQL connection
   settings:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=lostandfound
   ```

   Keep this file private; `.env` is excluded from version control.

3. Create the database and the table used by the API. The project does not
   include database migrations. For a fresh PostgreSQL database, the following
   table is compatible with the repository queries:

   ```sql
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

To compile the TypeScript and run the compiled server:

```bash
npm run build
npm start
```

## API

All report routes are prefixed with `/api/reports`. JSON request bodies should
use `Content-Type: application/json`.

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

`POST /api/reports` accepts these fields:

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

`student_id` is limited to 20 characters, `item_name` to 150, `category` to 50,
`location` to 150, and `contact_details` to 150. These string fields must be
non-empty after trimming; `description` has no configured maximum length.
`type` must be `lost` or `found`. `contact_details` may be omitted or `null`.
The database supplies `id` and the default `status` (`open`).

### Search and pagination

Search with a non-empty `searchName` query parameter:

```http
GET /api/reports/search?searchName=backpack
```

Pagination requires both `page` and `limit`. `page` must be at least `1`, and
`limit` must be between `1` and `100`:

```http
GET /api/reports/paginated?page=1&limit=10
```

The paginated response contains `Message`, `page`, `totalPages`, `Limit`,
`TotalReport`, and `Reports` fields.

### Updating and deleting

`PUT /api/reports/:id` takes the report fields (`student_id`, `item_name`,
`description`, `type`, `category`, `location`, and optionally
`contact_details`) and returns the updated report. `DELETE /api/reports/:id`
returns the deleted report. IDs must be positive integers.

## Responses and errors

Successful reads return JSON report objects or arrays. Creating a report
returns `201 Created`; other successful operations return `200 OK`.
Application errors use a JSON object with a `message` field. Invalid JSON and
invalid report creation or pagination input return `400 Bad Request`; missing
reports return `404 Not Found`; unexpected errors return `500 Internal Server
Error`. Unmatched routes return `404` with `message` and `requestedURL`.
