const nodemailer = require("nodemailer");

async function sendTestEmail() {
  const from = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const to = process.env.TEST_RECIPIENT || "kayantest1990@gmail.com";

  if (!from || !pass) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: from, pass },
  });

  await transporter.verify();

  return transporter.sendMail({
    from,
    to,
    subject: "Nodemailer Gmail test",
    text: `This is a test email sent with Nodemailer from ${from}.`,
    html: `<p>This is a test email sent with Nodemailer from <strong>${from}</strong>.</p>`,
  });
}

module.exports = { sendTestEmail };
