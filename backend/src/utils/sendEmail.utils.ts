import nodemailer from 'nodemailer';
import { ENV
  
 } from '../config/environtment.config';
export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT), // Gmail dùng 465 (SSL) hoặc 587 (TLS)
    secure: true, // true nếu port 465
    auth: {
      user: ENV.SMTP_USER, // Email gửi đi
      pass: ENV.SMTP_PASS, // Mật khẩu ứng dụng (app password)
    },
  });

  const mailOptions = {
    from: `"AZStay Support" <${ENV.SMTP_USER}>`,
    to,
    subject,
    html,
  };
  
  await transporter.sendMail(mailOptions);
};
