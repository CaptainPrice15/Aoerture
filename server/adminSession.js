import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'aperture_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const getSecret = () => process.env.SESSION_SECRET;

export const adminAuthIsConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD && getSecret() && getSecret().length >= 32);

const sign = (value, secret) =>
  createHmac('sha256', secret).update(value).digest('base64url');

const safeEqual = (left, right) => {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
};

export const verifyAdminPassword = (password) => {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && typeof password === 'string' && safeEqual(password, expected));
};

export const createAdminToken = () => {
  const secret = getSecret();
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
};

export const getAdminSession = (req) => {
  const secret = getSecret();
  if (!secret || secret.length < 32) return false;

  const cookieHeader = req.headers?.cookie || '';
  const token = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;

  try {
    if (!safeEqual(signature, sign(payload, secret))) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && Number.isInteger(data.exp) && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

const cookieOptions = (req) => {
  const secure = req.headers?.['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure ? '; Secure' : ''}`;
};

export const setAdminCookie = (req, res, token) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOptions(req)}`);
};

export const clearAdminCookie = (req, res) => {
  const secure = req.headers?.['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`);
};
