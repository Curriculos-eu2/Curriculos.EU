export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const key = `panfleto:${ip}`;
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  try {
    const getRes = await fetch(`${url}/get/${key}`, { headers: { Authorization: `Bearer ${token}` } });
    const getData = await getRes.json();
    const count = parseInt(getData.result || '0');

    if (count >= 2) {
      return res.status(429).json({ error: 'limit_reached' });
    }

    // Sem expiração — limite permanente por IP
    await fetch(`${url}/set/${key}/${count + 1}`, { headers: { Authorization: `Bearer ${token}` } });

    return res.status(200).json({ ok: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
