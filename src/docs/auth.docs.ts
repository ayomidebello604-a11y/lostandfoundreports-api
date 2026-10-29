/**
 * @openapi
 * tags:
 *   - name: Authentication
 *     description: User registration, authentication, token lifecycle, and account endpoints.
 */

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with default role "student". Passwords are automatically hashed with Argon2id.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 30
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: StrongPassword123!
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - user
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User Created
 *                 user:
 *                   type: object
 *                   required:
 *                     - name
 *                     - email
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Jane Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: jane@example.com
 *       '400':
 *         description: Bad request — validation error or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validated Request body is Missing
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user with their email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: samad@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       '200':
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - user
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User Authenticated
 *                 user:
 *                   type: object
 *                   required:
 *                     - user_id
 *                     - email
 *                     - name
 *                     - accessToken
 *                     - refreshToken
 *                     - expires_at
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       example: "07ee00cf-f485-4e01-8e1c-67c955f46ff8"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: samad@example.com
 *                     name:
 *                       type: string
 *                       example: Samad
 *                     accessToken:
 *                       type: string
 *                       description: JWT used to access protected endpoints.
 *                       example: eyJhbGciOi...
 *                     refreshToken:
 *                       type: string
 *                       description: Token used to obtain a new access token.
 *                       example: 7c9e012d4a...
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                       description: Refresh token expiration timestamp.
 *                       example: "2026-10-30T20:00:00.000Z"
 *       '400':
 *         description: Bad request — invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validated Request body is missing
 *       '401':
 *         description: Unauthorized — incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */

/**
 * @openapi
 * /api/user/refresh:
 *   post:
 *     summary: Rotate refresh token
 *     description: Validates and rotates an active refresh token inside a database transaction, revokes the old token, and issues a new access token and refresh token pair.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Plaintext refresh token to rotate
 *                 example: 7c9e012d4a5b6c7d8e9f...
 *     responses:
 *       '200':
 *         description: Token successfully rotated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - newTokens
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token successfully rotated
 *                 newTokens:
 *                   type: object
 *                   required:
 *                     - sessionId
 *                     - new_accessToken
 *                     - refreshToken
 *                     - expiresAt
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       format: uuid
 *                       example: d1f6e1f0-0d52-49b1-9a4d-a3a75b4d8ef3
 *                     new_accessToken:
 *                       type: string
 *                       example: eyJhbGciOi...
 *                     refreshToken:
 *                       type: string
 *                       example: 4a7b9c1d2e...
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-10-30T10:15:00.000Z"
 *       '400':
 *         description: Bad request — missing or empty refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token is required
 *       '401':
 *         description: Unauthorized — token is expired, revoked, or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to find corresponding token
 *       '404':
 *         description: Not found — user associated with token no longer exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to find User
 */

/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     summary: Log out a user
 *     description: Revokes the submitted refresh token in the database, invalidating the session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: 7c9e012d4a5b6c7d8e9f...
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - Message
 *                 - status
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: User Logged out
 *                 status:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Bad request — missing or empty refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token is required
 *       '401':
 *         description: Unauthorized — unable to revoke the specified token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to Logout User
 */

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches a list of all registered users (excluding password hashes). Requires a valid JWT access token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - users
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All Users
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - id
 *                       - name
 *                       - email
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "07ee00cf-f485-4e01-8e1c-67c955f46ff8"
 *                       name:
 *                         type: string
 *                         example: Jane Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: jane@example.com
 *       '401':
 *         description: Unauthorized — missing, invalid, or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

export {};
