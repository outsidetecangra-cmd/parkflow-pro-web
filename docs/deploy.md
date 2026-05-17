# Deploy (Supabase + Render + Vercel)

Este repo separa:

- **DB**: Supabase (PostgreSQL)
- **API**: Render (`apps/api`, NestJS)
- **Web**: Vercel (Next.js na raiz)

## 1) Supabase (Postgres)

1. Crie um projeto no Supabase.
2. Pegue **duas** connection strings:
   - **Pooler/PgBouncer** (porta 6543) para runtime (API).
   - **Direta** (porta 5432) para migrations/seed (mais estável com Prisma).
3. Variáveis (Render / local):

```
DATABASE_URL=...pooler...:6543/...?...pgbouncer=true
DIRECT_URL=...direta...:5432/...
```

Dica (pooler): com Prisma costuma ficar mais estÃ¡vel usando `pgbouncer=true&connection_limit=1&sslmode=require`.

### Erro comum (P1000 no Render)

Se o log mostrar algo como **"credentials for 'postgres' are not valid"** tentando conectar em `*.pooler.supabase.com:6543`, quase sempre Ã© porque o **usuÃ¡rio do pooler nÃ£o Ã© `postgres`**.

- No Supabase, o pooler costuma exigir `postgres.<project-ref>` (ou o usuÃ¡rio exatamente como aparece na string do pooler).
- No Render, salve `DATABASE_URL`/`DIRECT_URL` **sem aspas** (o painel jÃ¡ armazena como string).
- Se sua senha tiver caracteres especiais (`@`, `:`, `/`, `#`, `?`), faÃ§a **URL-encode** no campo da senha antes de colar na URL.

Observação: se você habilitar o IPv4 add-on/dedicated IP no Supabase, pode usar conexão direta (5432) para migrations/seed.

## 2) Render (API)

Blueprint: `render.yaml`.

No Render:

1. New → **Blueprint** → selecione o repo.
2. Configure env vars no serviço `parkflow-api`:
   - `DATABASE_URL` (pooler)
   - `DIRECT_URL` (direta para migrations/seed)
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

## Alternativa free (sem Render): Vercel + Supabase HTTP

Se vocÃª quiser eliminar o Render (e o problema de pooler/Prisma), este repo jÃ¡ tem um BFF em `app/api/pricing`.

1. No Vercel, configure:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Crie a tabela no Supabase (SQL Editor):

```sql
create table if not exists pricing_config (
  id text primary key,
  price_table_id text not null default 'demo',
  name text not null default 'Tabela Demo',
  grace_minutes int not null default 10,
  max_daily numeric null,
  first_hour numeric not null default 12,
  additional_fraction numeric not null default 6,
  updated_at timestamptz not null default now()
);

insert into pricing_config (id)
values ('default')
on conflict (id) do nothing;
```

Isso faz `/api/pricing` funcionar via Supabase REST, sem precisar do `apps/api`.

## 4) GitHub (CI/CD rápido)

Workflow: `.github/workflows/render-api-deploy.yml`.

1. Crie um **Deploy Hook** no Render (Settings → Deploy Hooks).
2. Adicione o secret no GitHub:
   - `RENDER_DEPLOY_HOOK_URL`

Cada push na `main` (alterando `apps/api/**` ou `prisma/**`) dispara um deploy no Render.
