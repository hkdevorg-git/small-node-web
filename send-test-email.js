const { sendTestEmail } = require("./email");

sendTestEmail()
  .then((info) => {
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
  })
  .catch((error) => {
    console.error("Failed to send email:", error.message);
    process.exit(1);
  });
