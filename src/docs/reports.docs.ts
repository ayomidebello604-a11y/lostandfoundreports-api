/**
 * @openapi
 * tags:
 *   - name: Reports
 *     description: Lost and found report creation, search, retrieval, updates, and deletion.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - id
 *         - student_id
 *         - item_name
 *         - description
 *         - type
 *         - category
 *         - location
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique numeric ID of the report
 *           example: 1
 *         user_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the user who filed the report
 *           example: "07ee00cf-f485-4e01-8e1c-67c955f46ff8"
 *         student_id:
 *           type: string
 *           maxLength: 20
 *           description: Student identification code
 *           example: STU-8821
 *         item_name:
 *           type: string
 *           maxLength: 150
 *           description: Name or title of the item
 *           example: Blue Backpack
 *         description:
 *           type: string
 *           description: Detailed description of the item
 *           example: A blue backpack with brown leather straps left on a bench.
 *         type:
 *           type: string
 *           enum:
 *             - lost
 *             - found
 *           example: lost
 *         category:
 *           type: string
 *           maxLength: 50
 *           example: Accessories
 *         location:
 *           type: string
 *           maxLength: 150
 *           example: Campus Library 2nd Floor
 *         status:
 *           type: string
 *           enum:
 *             - open
 *             - claimed
 *             - returned
 *             - closed
 *           default: open
 *           example: open
 *         contact_details:
 *           type: string
 *           maxLength: 150
 *           nullable: true
 *           example: student@example.com
 *     NewReportInput:
 *       type: object
 *       required:
 *         - student_id
 *         - item_name
 *         - description
 *         - type
 *         - category
 *         - location
 *       properties:
 *         student_id:
 *           type: string
 *           maxLength: 20
 *           example: STU-8821
 *         item_name:
 *           type: string
 *           maxLength: 150
 *           example: Blue Backpack
 *         description:
 *           type: string
 *           example: A blue backpack with brown leather straps left on a bench.
 *         type:
 *           type: string
 *           enum:
 *             - lost
 *             - found
 *           example: lost
 *         category:
 *           type: string
 *           maxLength: 50
 *           example: Accessories
 *         location:
 *           type: string
 *           maxLength: 150
 *           example: Campus Library 2nd Floor
 *         status:
 *           type: string
 *           enum:
 *             - open
 *             - claimed
 *             - returned
 *             - closed
 *           example: open
 *         contact_details:
 *           type: string
 *           maxLength: 150
 *           nullable: true
 *           example: student@example.com
 */

/**
 * @openapi
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     description: Files a new lost or found item report. The creating user's ID is automatically derived from the authenticated JWT.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReportInput'
 *     responses:
 *       '201':
 *         description: Report successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — invalid input or schema validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validated request body is missing
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 *       '404':
 *         description: Not found — failed to store report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Response Not Found
 *   get:
 *     summary: Retrieve all reports
 *     description: Fetches all lost and found reports in ascending order by ID.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Array of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

/**
 * @openapi
 * /api/reports/lost:
 *   get:
 *     summary: Retrieve all lost reports
 *     description: Fetches all reports where type is "lost", ordered by ID ascending.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of lost reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

/**
 * @openapi
 * /api/reports/found:
 *   get:
 *     summary: Retrieve all found reports
 *     description: Fetches all reports where type is "found", ordered by ID ascending.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of found reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

/**
 * @openapi
 * /api/reports/search:
 *   get:
 *     summary: Search reports by item name
 *     description: Performs a case-insensitive partial match search on item_name.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: searchName
 *         in: query
 *         required: true
 *         description: Substring term to search for within item names
 *         schema:
 *           type: string
 *         example: Backpack
 *     responses:
 *       '200':
 *         description: List of matching reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — searchName query parameter is missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search name must be provided as a non-empty string
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

/**
 * @openapi
 * /api/reports/paginated:
 *   get:
 *     summary: Retrieve paginated reports
 *     description: Retrieves a paginated subset of reports along with total counts and pagination metadata.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: true
 *         description: Page number (1-based index)
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: true
 *         description: Number of reports per page (maximum 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         example: 10
 *     responses:
 *       '200':
 *         description: Paginated reports and metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - Message
 *                 - page
 *                 - totalPages
 *                 - Limit
 *                 - TotalReport
 *                 - Reports
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: Paginated Reports Fetched
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 Limit:
 *                   type: integer
 *                   example: 10
 *                 TotalReport:
 *                   type: integer
 *                   example: 48
 *                 Reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — invalid page or limit parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Requested Query expected
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 */

/**
 * @openapi
 * /api/reports/{id}:
 *   get:
 *     summary: Retrieve a report by ID
 *     description: Fetches a single lost or found report by its numeric ID.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Positive integer ID of the report
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       '200':
 *         description: Report found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — invalid report ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid report ID
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 *       '404':
 *         description: Not found — no report exists with this ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to fetch a Report with this id
 *   put:
 *     summary: Update an existing report
 *     description: Updates all editable fields of an existing report. Only the student who created the report (or an admin) can update it.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Positive integer ID of the report to update
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReportInput'
 *     responses:
 *       '200':
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — invalid report ID or malformed request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid report ID
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 *       '404':
 *         description: Not found — report does not exist or caller is not authorized to edit it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to find the requested reports to be updated
 *   delete:
 *     summary: Delete a report
 *     description: Deletes a report by ID. Students can delete only reports they created. Admins can delete any report.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Positive integer ID of the report to delete
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       '200':
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       '400':
 *         description: Bad request — invalid report ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid report ID
 *       '401':
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization Header needed
 *       '403':
 *         description: Forbidden — user does not have permission to delete this report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission to perform this action
 *       '404':
 *         description: Not found — report not found or caller cannot delete it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to find the report with the provided id
 */

export {};

