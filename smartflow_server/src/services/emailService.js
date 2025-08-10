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