// 1.
/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     description: API cho phép người dùng đăng ký bằng email, mật khẩu và thông tin cá nhân. Tự động gửi email chào mừng và trả về JWT token.
 *     tags: [User - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - gender
 *               - phone
 *               - role
 *               - dob
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               phone:
 *                 type: string
 *               role:
 *                 type: integer
 *                 enum: [2, 3]
 *                 description: 2 = CUSTOMER, 3 = PROPERTY_OWNER
 *               dob:
 *                 type: string
 *                 format: date
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server khi đăng ký
 */

// 2.
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     description: API cho phép người dùng đăng nhập bằng email và mật khẩu. Trả về JWT token và thông tin người dùng nếu thành công.
 *     tags: [User - Authentication]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai email hoặc mật khẩu
 *       500:
 *         description: Lỗi server khi đăng nhập
 */

// 3.
/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     summary: Gửi mã OTP đến email người dùng
 *     description: API gửi mã OTP để đặt lại mật khẩu, mã sẽ hết hạn sau 15 phút.
 *     tags: [User - Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP đã được gửi thành công.
 *       404:
 *         description: Email không tồn tại trong hệ thống.
 *       500:
 *         description: Lỗi server khi gửi OTP.
 */

// 4.
/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: Xác thực OTP và tạo token đổi mật khẩu
 *     description: API xác minh mã OTP và trả về token có hiệu lực 15 phút để đổi mật khẩu.
 *     tags: [User - Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP hợp lệ, token đã được tạo.
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn.
 *       404:
 *         description: Email không tồn tại.
 *       500:
 *         description: Lỗi server khi xác minh OTP.
 */

// 5.
/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Change user password (requires password_reset token)
 *     description: |
 *       Đổi mật khẩu cho user sau khi xác thực OTP.  
 *       Token JWT loại `password_reset` phải được truyền trong header `Authorization`.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid or expired token / Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */