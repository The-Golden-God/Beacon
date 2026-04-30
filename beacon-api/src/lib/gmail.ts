import { google } from "googleapis";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getGmailAuthUrl(state: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state,
  });
}

export async function exchangeGmailCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  email: string;
}> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Missing tokens from Google");
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600_000),
    email: data.email!,
  };
}

export async function sendViaGmail(params: {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
}): Promise<{ messageId: string; newAccessToken?: string; newExpiry?: Date }> {
  const client = getOAuth2Client();
  client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
    expiry_date: params.tokenExpiry?.getTime(),
  });

  // googleapis handles refresh automatically via the client
  client.on("tokens", (_tokens) => {
    // tokens updated — caller should persist if needed (handled by return value)
  });

  const gmail = google.gmail({ version: "v1", auth: client });

  const mime = [
    `From: ${params.fromEmail}`,
    `To: ${params.toEmail}`,
    `Subject: =?utf-8?B?${Buffer.from(params.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(params.body).toString("base64"),
  ].join("\r\n");

  const encoded = Buffer.from(mime).toString("base64url");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  const newCreds = client.credentials;
  return {
    messageId: res.data.id ?? "",
    newAccessToken: newCreds.access_token ?? undefined,
    newExpiry: newCreds.expiry_date ? new Date(newCreds.expiry_date) : undefined,
  };
}
