const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing required environment variable: ${name}`);
    error.code = "MISSING_GMAIL_OAUTH_CONFIG";
    throw error;
  }
  return value;
}

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: requiredEnv("GOOGLE_CLIENT_ID"),
    client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
    signal: AbortSignal.timeout(10_000),
  });

  const result = await response.json();
  if (!response.ok || !result.access_token) {
    const error = new Error("Google OAuth token refresh failed");
    error.code = "GOOGLE_OAUTH_FAILED";
    error.status = response.status;
    throw error;
  }

  return result.access_token;
}

async function sendTestEmail() {
  const from = requiredEnv("GMAIL_USER");
  const to = process.env.TEST_RECIPIENT || "kayantest1990@gmail.com";
  const accessToken = await getAccessToken();

  const mimeMessage = [
    `From: ${from}`,
    `To: ${to}`,
    "Subject: Nodemailer Gmail test",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    `This is a test email sent with the Gmail API from ${from}.`,
  ].join("\r\n");

  const response = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ raw: Buffer.from(mimeMessage).toString("base64url") }),
    signal: AbortSignal.timeout(15_000),
  });

  const result = await response.json();
  if (!response.ok || !result.id) {
    const error = new Error("Gmail API rejected the message");
    error.code = "GMAIL_API_FAILED";
    error.status = response.status;
    throw error;
  }

  return { messageId: result.id };
}

module.exports = { sendTestEmail };
