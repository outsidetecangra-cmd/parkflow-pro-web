# Deploy free (sem Render) — Vercel + Supabase HTTP (precificaÃ§Ã£o)

Objetivo: colocar o **frontend** no Vercel e fazer a **precificaÃ§Ã£o** funcionar via `app/api/pricing` usando o Supabase via HTTP (sem Prisma/Pooler no backend).

## 1) Supabase: criar tabela

No Supabase â†’ SQL Editor:

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

## 2) Vercel: variÃ¡veis de ambiente

No projeto no Vercel:

- `SUPABASE_URL` = `https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = chave **service_role** (Project Settings â†’ API)

Opcional:

- `NEXT_PUBLIC_API_BASE_URL` **nÃ£o precisa** ser definido para a precificaÃ§Ã£o (o `/api/pricing` atende localmente).

## 3) Como validar

Depois do deploy:

- `GET https://<seu-dominio>/api/pricing` deve retornar `{ success: true, data: ... }`
- Atualize os valores na tela de precificaÃ§Ã£o e confira que o `PUT /api/pricing` retorna sucesso.

## ObservaÃ§Ã£o de seguranÃ§a

O `SUPABASE_SERVICE_ROLE_KEY` dÃ¡ permissÃ£o total ao banco. Use apenas no servidor (Vercel env) e nÃ£o exponha no cliente.

