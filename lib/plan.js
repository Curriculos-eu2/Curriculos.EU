// JWT mínimo sem dependências externas — compatível com Node 18+

const enc = new TextEncoder();

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

async function getKey(secret) {
  const { createHmac } = await import('node:crypto');
  return { sign: (data) => createHmac('sha256', secret).update(data).digest() };
}

export async function createToken({ email, tier = 'premium', daysValid = 31 }) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const header  = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = b64url(Buffer.from(JSON.stringify({
    sub: email,
    tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + daysValid * 86400,
  })));

  const { sign } = await getKey(secret);
  const sig = b64url(sign(`${header}.${payload}`));
  return `${header}.${payload}.${sig}`;
}

export async function checkPlan(token) {
  if (!token) return { tier: 'free' };

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { tier: 'free' };

    const [header, payload, sig] = parts;
    const secret = process.env.JWT_SECRET || 'fallback-secret';

    const { sign } = await getKey(secret);
    const expected = b64url(sign(`${header}.${payload}`));
    if (expected !== sig) return { tier: 'free' };

    const claims = JSON.parse(b64urlDecode(payload).toString());
    if (claims.exp < Math.floor(Date.now() / 1000)) return { tier: 'free' };

    return { tier: claims.tier || 'premium', email: claims.sub };
  } catch {
    return { tier: 'free' };
  }
}
