export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const key = `cv:${ip}`;
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

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
