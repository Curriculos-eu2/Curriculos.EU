import { validateInput } from '../lib/validate.js';
import { buildPrompts } from '../lib/prompts.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { checkPlan } from '../lib/plan.js';

export default async function handler(req, res) {

  // CORS
  const origin = req.headers['origin'] || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());
  const corsOk = allowed.includes('*') || allowed.includes(origin);
  res.setHeader('Access-Control-Allow-Origin', corsOk ? (allowed.includes('*') ? '*' : origin) : 'null');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Validação
  const body = req.body;
  const validation = validateInput(body);
  if (!validation.ok) return res.status(422).json({ error: validation.message });

  // Rate limiting por IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rate = await checkRateLimit(ip);
  if (!rate.ok) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ error: `Limite atingido. Tente novamente em ${rate.retryAfter}s.` });
  }

  // Verifica plano (gratuito ou premium)
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  const plan = await checkPlan(token);

  // Monta prompts
  const { systemPrompt, userPrompt } = buildPrompts(body, plan.tier);

  // Chama API do Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY não configurada');
    return res.status(500).json({ error: 'Configuração incompleta no servidor' });
  }

  let claudeRes;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: plan.tier === 'premium' ? 2000 : 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (err) {
    console.error('Erro ao chamar Claude:', err.message);
    return res.status(502).json({ error: 'Falha ao conectar à IA. Tente novamente.' });
  }

  if (!claudeRes.ok) {
    const errData = await claudeRes.json().catch(() => ({}));
    return res.status(claudeRes.status).json({ error: errData?.error?.message || 'Erro da API' });
  }

  const data = await claudeRes.json();
  const text = (data.content || []).map(b => b.type === 'text' ? b.text : '').join('');

  return res.status(200).json({
    curriculo: text,
    plan: plan.tier,
    usage: data.usage,
  });
}
