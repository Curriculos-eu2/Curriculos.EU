const COUNTRY_NAMES = { pt: 'Portugal', es: 'Espanha', uk: 'Reino Unido', de: 'Alemanha' };
const COUNTRY_LANG  = { pt: 'português europeu', es: 'espanhol', uk: 'English', de: 'Deutsch' };

const COUNTRY_FORMAT = {
  pt: 'Formato português: dados pessoais, objetivo profissional, experiência (cronologia inversa), formação académica, competências e disponibilidade. Tom profissional e caloroso.',
  es: 'Formato español: perfil profesional, experiencia laboral (cronología inversa), formación, competencias. Tono formal pero cercano.',
  uk: 'UK CV format: personal statement (3-4 lines), work experience (reverse chronological), education, skills. Concise and achievement-focused.',
  de: 'Deutsches Lebenslauf-Format: Berufsprofil, Berufserfahrung (com datas exatas), Ausbildung, Kenntnisse. Sachlich und strukturiert.',
};

const SECTOR_TIPS = {
  restaurante: {
    pt: 'Valorize atendimento ao cliente, trabalho em equipa e experiência em serviço de mesa.',
    es: 'Destaca atención al cliente, gestión de sala y disponibilidad en horario español.',
    uk: 'Emphasise customer service, teamwork, and any food hygiene certificates.',
    de: 'Betonen Sie Serviceorientierung, Teamarbeit und Pünktlichkeit.',
  },
  hotel: {
    pt: 'Destaque idiomas falados, experiência com check-in/check-out e atendimento multilingue.',
    es: 'Resalta idiomas, experiencia con PMS hoteleros y disponibilidad en temporada alta.',
    uk: 'Highlight languages, guest relations, and any PMS system knowledge.',
    de: 'Betonen Sie Sprachen, Gästebetreuung und Hotelverwaltungssysteme.',
  },
  limpeza: {
    pt: 'Destaque confiabilidade, atenção ao detalhe e disponibilidade de horários.',
    es: 'Resalta responsabilidad, puntualidad y flexibilidad horaria.',
    uk: 'Emphasise reliability, attention to detail, and any health & safety training.',
    de: 'Betonen Sie Zuverlässigkeit, Sorgfalt und Diskretion.',
  },
  construcao: {
    pt: 'Mencione ferramentas que sabe usar, tipos de obra realizadas e certificados de segurança.',
    es: 'Incluye certificado PRL (Prevención de Riesgos Laborales) e herramientas específicas.',
    uk: 'Mention CSCS card status, specific trade skills, and health & safety awareness.',
    de: 'Erwähnen Sie Fachkenntnisse, Sicherheitszertifikate e experiência em obras.',
  },
  domestico: {
    pt: 'Destaque confiabilidade, discrição, habilidades culinárias e cuidado com crianças/idosos.',
    es: 'Resalta responsabilidad, experiencia con familias y cuidado de niños o mayores.',
    uk: 'Emphasise trustworthiness, experience with families, cooking, and any DBS check status.',
    de: 'Betonen Sie Vertrauenswürdigkeit, Erfahrung mit Familien und Diskretion.',
  },
  cuidados: {
    pt: 'Destaque empatia, paciência e qualquer formação em saúde, mesmo que básica.',
    es: 'Incluye titulación en geriatría o auxiliar de enfermería y experiencia en cuidados.',
    uk: 'Highlight Care Certificate, NVQ qualifications, and experience with elderly or vulnerable individuals.',
    de: 'Betonen Sie Einfühlungsvermögen, Pflegeerfahrung e Deutschkenntnisse.',
  },
  armazem: {
    pt: 'Mencione experiência com logística, picking, packing e carta de empilhador se tiver.',
    es: 'Incluye experiencia en almacén, carretilla elevadora si la tienes y turnos rotativos.',
    uk: 'Mention warehouse experience, forklift licence if applicable, and physical fitness.',
    de: 'Erwähnen Sie Lagererfahrung, Staplerschein wenn vorhanden e körperliche Belastbarkeit.',
  },
  comercio: {
    pt: 'Destaque atendimento ao cliente, experiência em caixa e idiomas falados.',
    es: 'Resalta atención al cliente, experiencia en caja y gestión de stock.',
    uk: 'Emphasise customer service, till/POS experience, and communication skills.',
    de: 'Betonen Sie Kundenservice, Kassenerfahrung e Kommunikationsfähigkeiten.',
  },
};

export function buildPrompts(body, tier = 'free') {
  const { country, setor, nome, idade, email, tel, cidade, visto, cargo, exp, langs, avail, form } = body;

  const countryName = COUNTRY_NAMES[country];
  const lang        = COUNTRY_LANG[country];
  const fmt         = COUNTRY_FORMAT[country];
  const tip         = SECTOR_TIPS[setor]?.[country] || '';
  const isPremium   = tier === 'premium';
  const maxLen      = isPremium ? 'até 2 páginas se necessário' : 'máximo 1 página';

  const systemPrompt = `Você é um especialista em recrutamento no setor de ${setor} em ${countryName}. Escreva um currículo profissional em ${lang} para um(a) imigrante brasileiro(a).

${fmt}

Dicas para este setor e país:
${tip}

Regras:
- Escreva APENAS o conteúdo do currículo. Sem comentários ou explicações extras.
- Use os títulos de seção corretos para o mercado local.
- Adapte vocabulário e tom para o país — sem expressões tipicamente brasileiras.
- ${maxLen}.
- Nunca invente informações. Use apenas o que foi fornecido.
- Se a experiência for pouca, valorize habilidades transferíveis e disposição para aprender.
- IMPORTANTE: inclua o status de visto/documento logo abaixo do nome e contacto — é o primeiro dado que recrutadores europeus verificam.`;

  const langStr  = Array.isArray(langs) ? langs.join(', ') : 'Português (nativo)';
  const availStr = Array.isArray(avail) && avail.length ? avail.join(', ') : 'Horário flexível';
  const formStr  = form?.trim() || 'Ensino médio completo';
  const locStr   = cidade?.trim() || countryName;
  const vistoStr = visto?.trim() || '';

  const userPrompt = `Nome: ${nome}${idade ? ', ' + idade + ' anos' : ''}
Email: ${email}${tel ? ' | Tel: ' + tel : ''}
Cidade de destino: ${locStr}${vistoStr ? '\nStatus de visto / documento: ' + vistoStr : ''}
Cargo desejado: ${cargo}
Setor: ${setor}

Experiência profissional:
${exp}

Idiomas: ${langStr}
Formação: ${formStr}
Disponibilidade: ${availStr}
${isPremium ? '\nIncluir palavras-chave para sistemas ATS (triagem automática de currículos).' : ''}

Gere o currículo completo e profissional. O status de visto deve aparecer logo no cabeçalho, ao lado da nacionalidade.`;

  return { systemPrompt, userPrompt };
}
