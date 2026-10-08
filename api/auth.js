import {
  adminAuthIsConfigured,
  createAdminToken,
  getAdminSession,
  setAdminCookie,
  clearAdminCookie,
  verifyAdminPassword
} from '../server/adminSession.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: getAdminSession(req) });
  }

  if (req.method === 'DELETE') {
    clearAdminCookie(req, res);
    return res.status(200).json({ authenticated: false });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!adminAuthIsConfigured()) {
    return res.status(503).json({ error: 'Set ADMIN_PASSWORD and a SESSION_SECRET of at least 32 characters.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
  }
  const password = body?.password;
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid administrator password.' });
  }

  setAdminCookie(req, res, createAdminToken());
  return res.status(200).json({ authenticated: true, user: { id: 'admin', name: 'Admin', email: 'admin', role: 'admin' } });
}
