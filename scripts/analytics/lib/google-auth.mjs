// Service-account OAuth (JWT bearer, RS256) using node built-ins only.
import crypto from 'node:crypto';

const b64u = (b) => Buffer.from(b).toString('base64url');

export async function getAccessToken(key, scope) {
  const tokenUri = key.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64u(JSON.stringify({
    iss: key.client_email, scope, aud: tokenUri, iat: now, exp: now + 3600,
  }));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const sig = signer.sign(key.private_key).toString('base64url');
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${sig}`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`Google token request failed: HTTP ${res.status} ${data.error_description || data.error || ''}`.trim());
  }
  return data.access_token;
}
