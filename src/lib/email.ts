import nodemailer from "nodemailer";

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "VJConnect <no-reply@hopdongthue.com>";

  const subject = "Đặt lại mật khẩu VJConnect";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Đặt lại mật khẩu</h2>
      <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản VJConnect (${to}).</p>
      <p>Bấm vào nút bên dưới để đặt mật khẩu mới. Liên kết có hiệu lực trong 1 giờ.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #814775; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
      </p>
      <p style="color: #666; font-size: 13px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này — mật khẩu của bạn sẽ không thay đổi.</p>
    </div>
  `;

  if (!transporter) {
    // SMTP chưa được cấu hình — log liên kết ra console để không chặn luồng phát triển/kiểm thử.
    console.warn(
      `[email] SMTP chưa cấu hình (thiếu SMTP_HOST/SMTP_USER/SMTP_PASS). Liên kết đặt lại mật khẩu cho ${to}: ${resetUrl}`,
    );
    return { sent: false };
  }

  await transporter.sendMail({ from, to, subject, html });
  return { sent: true };
}
