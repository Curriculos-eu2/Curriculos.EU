// Rate limiting em memória — funciona no Vercel sem dependências extras
// Limite: 3 gerações por hora por IP (gratuito) | 60 por hora (premium)

const store = new Map();
const WINDOW_MS  = 60 * 60 * 1000; // 1 hora
const FREE_LIMIT = 3;
const PAID_LIMIT = 60;

export async function checkRateLimit(ip, isPremium = false) {
  const limit = isPremium ? PAID_LIMIT : FREE_LIMIT;
  const now   = Date.now();
  let record  = store.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { count: 0, windowStart: now };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    return { ok: false, retryAfter };
  }

  record.count++;
  store.set(ip, record);

  // Limpeza periódica para evitar memory leak
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (now - v.windowStart > WINDOW_MS) store.delete(k);
    }
  }

  return { ok: true };
}
