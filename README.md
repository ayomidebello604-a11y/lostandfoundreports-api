## Authorization flow

1. The client sends a JWT in the `Authorization` header using the `Bearer` scheme.
2. The `verifyUserToken` middleware validates the token using the server `JWT_SECRET`.
3. If valid, the middleware attaches `req.userId` and `req.userRole` to the request.
4. Protected routes such as `/api/reports` continue to the controller logic only after authentication succeeds.
5. Role-based routes use `authorizeRoles(...)` to enforce access rules.

Example:

```http
GET /api/reports
Authorization: Bearer TOKEN
```

Admin-only example:

```http
DELETE /api/reports/42
Authorization: Bearer ADMIN_TOKEN
```

`401 Unauthorized` means missing, invalid, or expired token.
`403 Forbidden` means valid token but insufficient role.
