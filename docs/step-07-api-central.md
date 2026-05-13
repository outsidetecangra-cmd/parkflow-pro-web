# Passo 7 - API Central

Objetivo deste passo:

- preparar a base da `API Central`
- alinhar a estrutura com os contratos do passo 4
- encaixar a API no repositório sem quebrar o web atual

## Decisao

A API central sera estruturada em `apps/api` com organizacao estilo `NestJS`.

Motivo:

- dominio grande
- multiplos modulos
- autenticacao
- regras de negocio
- sincronizacao com agente local
- crescimento mais controlado

## Responsabilidades da API

- autenticar usuarios do web
- autenticar agentes locais
- entregar contexto da unidade
- consultar ticket
- registrar entrada
- calcular saida
- confirmar saida
- receber eventos do agente
- processar lotes de sincronizacao
- armazenar status de dispositivos

## Modulos iniciais

- `auth`
- `users`
- `units`
- `tickets`
- `operations`
- `payments`
- `agents`
- `devices`
- `sync`

## Decisao de infraestrutura local

Nesta fase:

- o schema Prisma continua na raiz em `prisma/schema.prisma`
- a seed continua na raiz em `prisma/seed.ts`
- `apps/api` consome esse schema

Isso evita mover tudo cedo demais.

## Entregavel deste passo

- pasta `apps/api`
- `package.json`
- `tsconfig`
- `nest-cli.json`
- `main.ts`
- `app.module.ts`
- `prisma.module.ts`
- `prisma.service.ts`
- modulos iniciais por dominio

## Proximo passo apos este

- implementar os primeiros endpoints reais:
  - `POST /auth/login`
  - `POST /auth/agent/login`
  - `GET /me/context`
  - `GET /tickets/search`
  - `POST /operations/entry`
