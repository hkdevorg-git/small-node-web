const http = require("node:http");
const { sendTestEmail } = require("./email");

const port = Number(process.env.PORT) || 10000;
let sending = false;
let lastSentAt = 0;
const cooldownMs = 30_000;

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "POST" && req.url === "/send-email") {
    const remainingMs = cooldownMs - (Date.now() - lastSentAt);

    if (sending || remainingMs > 0) {
      sendJson(res, 429, {
        error: "Please wait before sending another test email.",
      });
      return;
    }

    sending = true;
    try {
      const info = await sendTestEmail();
      lastSentAt = Date.now();
      sendJson(res, 200, { ok: true, messageId: info.messageId });
    } catch (error) {
      console.error("Failed to send email:", error.code || error.message);
      const status = error.code === "MISSING_GMAIL_OAUTH_CONFIG" ? 503 : 502;
      const message = error.code === "MISSING_GMAIL_OAUTH_CONFIG"
        ? "Google OAuth is not configured. Add the Gmail API credentials in Render."
        : error.code === "GOOGLE_OAUTH_FAILED" || error.code === "GMAIL_API_FAILED"
          ? "Google rejected the authorization or send request. Check the OAuth setup and Gmail API access."
          : "The Gmail API request failed or timed out. Try again shortly.";
      sendJson(res, status, { error: message });
    } finally {
      sending = false;
    }
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gmail API Email Test</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 34rem; margin: 4rem auto; padding: 0 1rem; }
      button { padding: .7rem 1rem; cursor: pointer; }
      #status { min-height: 1.5rem; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <h1>Gmail API Test</h1>
    <p>Send a test message to the configured recipient.</p>
    <button id="send" type="button">Send test email</button>
    <p id="status" role="status"></p>
    <script>
      const button = document.querySelector("#send");
      const status = document.querySelector("#status");
      button.addEventListener("click", async () => {
        button.disabled = true;
        status.textContent = "Sending…";
        try {
          const response = await fetch("/send-email", {
            method: "POST",
            signal: AbortSignal.timeout(15000)
          });
          const result = await response.json();
          status.textContent = response.ok
            ? "Email sent successfully."
            : result.error;
        } catch {
          status.textContent = "The request timed out. Check Render's email settings and logs.";
        } finally {
          button.disabled = false;
        }
      });
    </script>
  </body>
</html>`);
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not found\n");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
