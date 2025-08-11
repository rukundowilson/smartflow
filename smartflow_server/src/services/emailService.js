import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.EMAIL_FROM || 'rukundowilson5@gmail.com' || smtpUser || 'no-reply@smartflow.local';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) throw new Error('sendEmail: `to` is required');
  const t = getTransporter();
  const info = await t.sendMail({ from: fromEmail, to, subject, text, html });
  return info;
}

export async function sendAccessGrantedEmail({ to, systemName, requestId }) {
  const subject = `Access Granted: ${systemName}`;
  const text = `Your access request #${requestId} for ${systemName} has been granted.`;
  const html = `<p>Your access request <strong>#${requestId}</strong> for <strong>${systemName}</strong> has been granted.</p>`;
  return sendEmail({ to, subject, text, html });
}

export async function sendAccessRevokedEmail({ to, systemName, reason = 'Access expiration' }) {
  const subject = `Access Revoked: ${systemName}`;
  const text = `Your access to ${systemName} has been revoked. Reason: ${reason}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">🔒 Access Revoked</h2>
      <p>Your access to <strong>${systemName}</strong> has been revoked.</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>If you need access to this system again, please submit a new access request through the SmartFlow system.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">This is an automated notification from SmartFlow IT Management System.</p>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
} 