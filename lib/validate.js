const SETORES = [
  'restaurante', 'hotel', 'limpeza', 'construcao',
  'domestico', 'cuidados', 'armazem', 'comercio','beleza', 'motorista', 'agricultura', 'fitness',
    'ti', 'bares', 'seguranca', 'educacao_infantil',
    'marketing', 'eletricista',
];

const PAISES = ['pt', 'es', 'uk', 'de', 'nl', 'fr', 'it', 'ie', 'ch', 'be', 'at', 'se'];

export function validateInput(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Dados inválidos' };
  }

  const { nome, email, country, setor, cargo, exp } = body;

  if (!nome?.trim())               return { ok: false, message: 'Nome é obrigatório' };
  if (!email?.includes('@'))       return { ok: false, message: 'Email inválido' };
  if (!PAISES.includes(country))   return { ok: false, message: 'País inválido' };
  if (!SETORES.includes(setor))    return { ok: false, message: 'Setor inválido' };
  if (!cargo?.trim())              return { ok: false, message: 'Cargo é obrigatório' };
  if (!exp?.trim() || exp.trim().length < 10) {
    return { ok: false, message: 'Descreva sua experiência (mínimo 10 caracteres)' };
  }

  // Limite de tamanho
  for (const [key, val] of Object.entries({ nome, cargo, exp })) {
    if (typeof val === 'string' && val.length > 1500) {
      return { ok: false, message: `Campo "${key}" muito longo` };
    }
  }

  // Sanitização básica
  for (const key of ['nome', 'cargo', 'exp', 'cidade', 'form']) {
    if (body[key]) {
      body[key] = body[key]
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .trim();
    }
  }

  return { ok: true };
}
