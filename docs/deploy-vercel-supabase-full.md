# Deploy completo (online) â€” Vercel + Supabase (sem Render)

Objetivo: **Web + API** no Vercel (Next Route Handlers) e **Postgres** no Supabase.

## 1) Supabase (DB)

1. Crie um projeto no Supabase.
2. Pegue a connection string **direta** (porta 5432).
3. No seu computador, defina no `.env` local:

```env
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.supabase.com:5432/postgres?sslmode=require"
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.supabase.com:5432/postgres?sslmode=require"
SEED_ADMIN_PASSWORD="uma-senha-forte"
SEED_AGENT_SECRET="um-segredo-forte"
```

4. Aplique schema e seed:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

## 2) Vercel (Web + API)

1. Importe o repositÃ³rio no Vercel.
2. Configure as env vars no Vercel (Production + Preview):
   - `SUPABASE_URL` (ex.: `https://<project-ref>.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings â†’ API â†’ service_role)
   - `JWT_SECRET` (forte)
3. Deploy.

## 3) ValidaÃ§Ã£o rÃ¡pida (pÃ³s-deploy)

- `POST /api/auth/login` com:
  - login: `admin.demo@example.invalid`
  - senha: valor de `SEED_ADMIN_PASSWORD` usado no seed
- `GET /api/me/context` com `Authorization: Bearer <accessToken>`
- Fluxo:
  - `POST /api/operations/entry`
  - `POST /api/operations/exit/calculate`
  - `POST /api/operations/exit/confirm`

## SeguranÃ§a

`SUPABASE_SERVICE_ROLE_KEY` dÃ¡ permissÃ£o total ao banco. Mantenha **somente** no Vercel (server-side) e nunca exponha no cliente.

