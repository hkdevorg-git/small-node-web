const nodemailer = require("nodemailer");

const from = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
const to = process.env.TEST_RECIPIENT || "kayantest1990@gmail.com";

if (!from || !pass) {
  console.error(
    "Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variable."
  );
  process.exit(1);
}

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: from, pass },
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Nodemailer Gmail test",
    text: `This is a test email sent with Nodemailer from ${from}.`,
    html: `<p>This is a test email sent with Nodemailer from <strong>${from}</strong>.</p>`,
  });

  console.log(`Email sent successfully. Message ID: ${info.messageId}`);
}

main().catch((error) => {
  console.error("Failed to send email:", error.message);
  process.exit(1);
});
