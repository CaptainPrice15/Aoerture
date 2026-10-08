import { handleMediaUpload } from '../server/uploadMedia.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const result = await handleMediaUpload(req);
  if (result.allow) res.setHeader('Allow', result.allow);
  return res.status(result.status).json(result.body);
}
