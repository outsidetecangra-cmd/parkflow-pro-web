# Parkflow Pro

Demo SaaS para gestao de estacionamentos com foco em operacao, caixa, OCR/LPR, autoatendimento, auditoria, valet, ERP e fiscal.

## Planejamento salvo

As decisoes e os passos combinados ficam em [docs/README.md](</D:/app estacionamento/app estacionamento 2/docs/README.md>).

## Estrutura atual

- `app/`, `components/`, `lib/`: demo web atual
- `prisma/`: schema e seed centrais
- `apps/api`: base inicial da API central
- `apps/agent`: base inicial do agente local

## Stack

- Next.js 14 + React + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Mocks locais para OCR, cancelas, fiscal, pagamentos e eventos

## Rotas principais

- `/login`
- `/dashboard`
- `/operacao/entrada`
- `/operacao/saida`
- `/operacao/patio`
- `/operacao/consulta`
- `/caixa`
- `/caixa/abertura`
- `/caixa/fechamento`
- `/pagamentos`
- `/mensalistas`
- `/credenciados`
- `/convenios`
- `/selos`
- `/tabelas-preco`
- `/automacao/equipamentos`
- `/automacao/eventos`
- `/ocr/capturas`
- `/auditoria/ocorrencias`
- `/totem`
- `/app-cliente`
- `/mobile-operador`
- `/valet/fila`
- `/erp/financeiro`
- `/erp/estoque`
- `/erp/sinistros`
- `/fiscal/rps`
- `/fiscal/nfse`
- `/relatorios`
- `/admin/usuarios`
- `/admin/unidades`
- `/admin/configuracoes`

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env` com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parkflow"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/parkflow"
```

3. Suba o Postgres local (recomendado):

```bash
docker compose up -d
```

4. Gere o client Prisma:

```bash
npm run prisma:generate
```

5. Rode a seed:

```bash
npm run prisma:seed
```

6. Inicie em desenvolvimento:

```bash
npm run dev
```

## Subir os blocos

Web:

```bash
npm run dev
```

API central:

```bash
npm run api:dev
```

Agente local:

```bash
npm run agent:dev
```

## Credenciais demo

- Web:
  - login: `admin.demo@example.invalid`
  - senha: `troque-esta-senha`
- Agente local:
  - `unitCode`: `ATL`
  - `deviceName`: `agent-atl-01`
  - `agentKey`: `troque-este-segredo`

## Status atual da execucao

Ja preparado:

- dependencias da raiz instaladas
- dependencias de `apps/api` instaladas
- dependencias de `apps/agent` instaladas
- Prisma Client gerado

Bloqueio atual:

- se nÃ£o houver PostgreSQL ativo em `localhost:5432` (use `docker compose up -d`)

Sem isso:

- a API central nao sobe corretamente
- `prisma migrate` e `prisma:seed` nao conseguem concluir
- o agente local nao autentica contra a API

## Deploy (Supabase + Render + Vercel)

Guia direto: `docs/deploy.md`.

Alternativa free (sem Render, focado em precificaÃ§Ã£o): `docs/deploy-free-no-render.md`.

Deploy completo (sem Render): `docs/deploy-vercel-supabase-full.md`.

## O que esta implementado

- Shell visual SaaS com sidebar escura, topbar, cards e tabelas modernas
- Dashboard operacional com indicadores, caixas, automacao e fila de valet
- Telas operacionais dedicadas para entrada e saida de veiculos
- Mecanismo generico para os demais modulos obrigatorios
- APIs mockadas para dashboard, ticket operacional, eventos de automacao e RPS
- Schema Prisma com os models principais do dominio
- Seed inicial para demonstracao local

## Observacoes

- Integracoes externas foram mantidas como simulacoes estruturadas.
- O seed Prisma cobre a base central da demo; os mocks de interface cobrem o restante da massa demonstrativa.

