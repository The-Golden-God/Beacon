const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const SEND_URL = "https://graph.microsoft.com/v1.0/me/sendMail";
const ME_URL = "https://graph.microsoft.com/v1.0/me";

export function getOutlookAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_type: "code",
    scope: "https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access",
    state,
    response_mode: "query",
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeOutlookCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  email: string;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json() as Record<string, string>;
  if (data.error) throw new Error(data.error_description ?? data.error);

  const userRes = await fetch(ME_URL, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json() as Record<string, string>;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiry: new Date(Date.now() + parseInt(data.expires_in) * 1000),
    email: user.mail ?? user.userPrincipalName,
  };
}

async function refreshOutlookToken(refreshToken: string): Promise<{ accessToken: string; expiry: Date }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/Mail.Send offline_access",
    }),
  });
  const data = await res.json() as Record<string, string>;
  if (data.error) throw new Error(data.error_description ?? data.error);
  return {
    accessToken: data.access_token,
    expiry: new Date(Date.now() + parseInt(data.expires_in) * 1000),
  };
}

export async function sendViaOutlook(params: {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
  toEmail: string;
  subject: string;
  body: string;
}): Promise<{ messageId: string; newAccessToken?: string; newExpiry?: Date }> {
  let { accessToken } = params;
  let newAccessToken: string | undefined;
  let newExpiry: Date | undefined;

  if (!params.tokenExpiry || params.tokenExpiry.getTime() < Date.now() + 60_000) {
    const refreshed = await refreshOutlookToken(params.refreshToken);
    accessToken = refreshed.accessToken;
    newAccessToken = refreshed.accessToken;
    newExpiry = refreshed.expiry;
  }

  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: params.subject,
        body: { contentType: "Text", content: params.body },
        toRecipients: [{ emailAddress: { address: params.toEmail } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok && res.status !== 202) {
    const err = await res.json().catch(() => ({})) as Record<string, any>;
    throw new Error(err.error?.message ?? `Outlook send failed (${res.status})`);
  }

  const messageId = res.headers.get("request-id") ?? crypto.randomUUID();
  return { messageId, newAccessToken, newExpiry };
}
