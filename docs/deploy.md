# Deploy (Supabase + Render + Vercel)

Este repo separa:

- **DB**: Supabase (PostgreSQL)
- **API**: Render (`apps/api`, NestJS)
- **Web**: Vercel (Next.js na raiz)

## 1) Supabase (Postgres)

1. Crie um projeto no Supabase.
2. Pegue **duas** connection strings:
   - **Pooler/PgBouncer** (porta 6543) para runtime (API) e migrations (na free tier).
3. Variáveis (Render / local):

```
DATABASE_URL=...pooler...:6543/...?...pgbouncer=true
```

Observação: se você habilitar o IPv4 add-on/dedicated IP no Supabase, pode usar conexão direta (5432) para migrations/seed.

## 2) Render (API)

Blueprint: `render.yaml`.

No Render:

1. New → **Blueprint** → selecione o repo.
2. Configure env vars no serviço `parkflow-api`:
   - `DATABASE_URL` (pooler)
   - `DIRECT_URL` (direta)
   - `JWT_SECRET` (forte)
   - `CORS_ORIGIN` (ex.: `https://<seu-app>.vercel.app,http://localhost:3000`)
3. Deploy.

Healthcheck:

- `GET /api/health`

## 3) Vercel (Web)

1. Importe o repo no Vercel.
2. Defina `NEXT_PUBLIC_API_BASE_URL` apontando para o Render:

```
NEXT_PUBLIC_API_BASE_URL=https://<render-service>.onrender.com/api
```

3. Deploy.

## 4) GitHub (CI/CD rápido)

Workflow: `.github/workflows/render-api-deploy.yml`.

1. Crie um **Deploy Hook** no Render (Settings → Deploy Hooks).
2. Adicione o secret no GitHub:
   - `RENDER_DEPLOY_HOOK_URL`

Cada push na `main` (alterando `apps/api/**` ou `prisma/**`) dispara um deploy no Render.
