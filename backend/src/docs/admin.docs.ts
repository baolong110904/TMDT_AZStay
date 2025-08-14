// 1.
/**
 * @swagger
 * /admin/get-revenue:
 *   post:
 *     summary: Get revenue by filtering month and year
 *     description: Returns revenue statistics for bookings and auctions based on a given month and year.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *             properties:
 *               month:
 *                 type: integer
 *                 example: 8
 *                 description: Month number (1-12)
 *               year:
 *                 type: integer
 *                 example: 2025
 *                 description: Full year
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooking:
 *                   type: number
 *                   example: 10000
 *                 totalAuction:
 *                   type: number
 *                   example: 5000
 *                 totalRevenue: 15000
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
