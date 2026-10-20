# Gmail API email test

The web page sends a test message through the Gmail API. Configure these values
as Render environment variables; do not commit real credentials:

- `GMAIL_USER`: the Gmail account that grants consent
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret
- `GOOGLE_REFRESH_TOKEN`: refresh token with the `gmail.send` scope
- `TEST_RECIPIENT`: recipient address

## Create the OAuth refresh token

1. In Google Cloud Console, create a project and enable the Gmail API.
2. Configure the OAuth consent screen and create an OAuth client ID. Add
   `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
   In its settings, enable **Use your own OAuth credentials**, enter the client
   ID and secret, and select server-side access with offline access.
4. Request `https://www.googleapis.com/auth/gmail.send`, authorize as
   `hkdev.org@gmail.com`, then exchange the authorization code for tokens.
5. Add the client ID, client secret, and refresh token to the Render service's
   environment variables. Keep the secret and refresh token private.

The API sends a base64url-encoded MIME message using the Gmail
`users.messages.send` endpoint.
