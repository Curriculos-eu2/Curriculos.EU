import { createToken } from '../lib/plan.js';
import { createHmac } from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Valida assinatura do Hotmart
  const signature = req.headers['x-hotmart-signature'];
  const secret = process.env.HOTMART_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }
  }

  const { event, data } = req.body || {};

  if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
    const email = data?.buyer?.email;
    if (!email) return res.status(400).json({ error: 'Email não encontrado' });

    const token = await createToken({ email, tier: 'premium', daysValid: 31 });
    console.log(`Premium ativado: ${email}`);

    // TODO: enviar token por email usando Resend ou SendGrid
    // await sendEmail(email, token);

    return res.status(200).json({ ok: true });
  }

  if (
    event === 'PURCHASE_REFUNDED' ||
    event === 'PURCHASE_CANCELED' ||
    event === 'SUBSCRIPTION_CANCELLATION'
  ) {
    console.log(`Plano cancelado: ${data?.buyer?.email}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, message: 'Evento ignorado' });
}
