const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_SECURE } =
    process.env;

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("MAIL_USER and MAIL_PASS must be set to send email");
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST || "smtp.gmail.com",
    port: Number(MAIL_PORT || 587),
    secure: MAIL_SECURE === "true",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Send one email to a single recipient.
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) throw new Error("Recipient email is required");

  const fromName = process.env.MAIL_FROM_NAME || "Breath Analysis";
  const fromAddress = process.env.MAIL_FROM || process.env.MAIL_USER;

  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}

/**
 * Send the same message to many recipients (one message per address).
 * Safer than BCC-all for personalised incomplete-assessment reminders.
 */
async function sendBulkEmail({ recipients, subject, text, html }) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error("Recipients must be a non-empty array");
  }

  const results = [];
  for (const to of recipients) {
    try {
      const info = await sendEmail({ to, subject, text, html });
      results.push({ to, ok: true, messageId: info.messageId });
    } catch (err) {
      results.push({ to, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = {
  sendEmail,
  sendBulkEmail,
  getTransporter,
};
