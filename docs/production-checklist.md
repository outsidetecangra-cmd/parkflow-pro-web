# Checklist de producao (deploy)

## 1) Banco de dados

- Provisionar PostgreSQL gerenciado (ou em VPS).
- Definir `DATABASE_URL` apontando para o banco de producao.
- Rodar migrations em producao: `npm run prisma:migrate:deploy`.
- Rodar seed **apenas** se for ambiente de demo: `npm run prisma:seed`.

## 2) API central (`apps/api`)

- Definir `JWT_SECRET` forte (min 32+ chars aleatorios).
- Definir `CORS_ORIGIN` com a URL do front (ex.: `https://seu-dominio.com`).
- Subir a API com `PORT` e `DATABASE_URL` configurados.
- Validar healthcheck: `GET /api/health`.

## 3) Web (Next.js)

- Definir `NEXT_PUBLIC_API_BASE_URL` apontando para a API publicada (ex.: `https://api.seu-dominio.com/api`).
- Fazer build e start em modo producao: `npm run build` e `npm run start`.

## 4) Segredos e operacao

- Garantir que `.env` nao seja versionado (usar `.env.example` como referencia).
- Habilitar logs e monitoramento (Sentry/Logtail/etc.) quando for ambiente real.
- Configurar HTTPS, rate limiting e WAF/regras basicas no provedor (quando aplicavel).

