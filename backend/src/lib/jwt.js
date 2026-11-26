const crypto = require('node:crypto');

let ephemeralDevSecret = null;

function getJwtSecret() {
  const configured = process.env.JWT_SECRET && process.env.JWT_SECRET.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET wajib dikonfigurasi pada environment production.');
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
    console.warn(
      '⚠️ [JWT] JWT_SECRET belum diatur di .env. Menggunakan kunci sementara runtime (token akan reset saat server dimulai ulang).'
    );
  }
  return ephemeralDevSecret;
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signJwt(payload, { expiresInSeconds = 60 * 60 * 24 * 7, secret } = {}) {
  const signingSecret = secret || getJwtSecret();
  const nowSec = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: nowSec,
    exp: nowSec + Number(expiresInSeconds),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', signingSecret).update(data).digest();
  return `${data}.${base64UrlEncode(signature)}`;
}

function verifyJwt(token, { secret } = {}) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

    const signingSecret = secret || getJwtSecret();
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', signingSecret).update(`${encodedHeader}.${encodedPayload}`).digest()
    );

    const a = Buffer.from(encodedSignature, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || nowSec >= payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  signJwt,
  verifyJwt,
};
