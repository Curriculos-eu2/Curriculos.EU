# CurrículoEU

Gerador de currículos adaptados por país e setor para brasileiros que querem trabalhar na Europa.

## Estrutura dos arquivos

```
curriculoeu/
├── public/
│   └── index.html          ← site completo (landing page + formulário)
├── api/
│   ├── generate.js         ← endpoint que chama o Claude com segurança
│   └── webhook-hotmart.js  ← ativa plano premium após pagamento
├── lib/
│   ├── prompts.js          ← prompts por setor e país
│   ├── validate.js         ← validação de inputs
│   ├── rateLimit.js        ← limite de uso por IP
│   └── plan.js             ← tokens JWT premium
├── vercel.json             ← configuração do Vercel
├── package.json
├── .gitignore
└── .env.example            ← template das variáveis de ambiente
```

## Deploy no Vercel

### 1. Suba os arquivos para o GitHub
Crie um repositório e envie todos esses arquivos.

### 2. Conecte ao Vercel
Acesse vercel.com → "Add New" → "Project" → importe o repositório.

### 3. Adicione as variáveis de ambiente
Em Settings → Environment Variables, adicione:

| Nome | Valor |
|------|-------|
| ANTHROPIC_API_KEY | sua chave do console.anthropic.com |
| JWT_SECRET | qualquer texto longo e aleatório |
| HOTMART_WEBHOOK_SECRET | configure depois no Hotmart |
| ALLOWED_ORIGINS | * (depois troque pela URL do site) |

### 4. Deploy
Clique em "Deploy". Pronto — seu site estará em `curriculoeu.vercel.app`.

## Personalizações importantes

Antes de publicar, edite o `public/index.html` e troque:

- `https://pay.hotmart.com/SEU-LINK-AQUI` → link real do seu produto no Hotmart
- `oi@curriculoeu.com` → seu email real

## Custo estimado de API

| Volume mensal | Custo Claude API |
|---------------|-----------------|
| 500 currículos | ~$1,50 |
| 2.000 currículos | ~$6,00 |
| 10.000 currículos | ~$30,00 |
