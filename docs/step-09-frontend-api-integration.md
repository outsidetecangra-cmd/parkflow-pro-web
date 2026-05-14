# Passo 09: Integracao Frontend com API Real

## Objetivo

Conectar o frontend `Next.js` aos endpoints reais da API central nos fluxos mais importantes da demonstracao:

- login
- contexto do usuario
- operacao de entrada
- operacao de saida

## O que foi concluido

### Login e sessao

- `app/login/page.tsx` usa a tela real de login.
- `components/login-form.tsx` autentica em `POST /api/auth/login`.
- `lib/api.ts` persiste a sessao no navegador.

### Contexto do usuario

- `components/topbar-context.tsx` carrega `GET /api/me/context`.
- `components/topbar.tsx` exibe o contexto real.
- `apps/api/src/modules/users/users.service.ts` passou a retornar `operationDefaults` com:
  - patio padrao
  - tabela de preco padrao
  - camera padrao
  - terminal padrao

### Operacao de saida

- `app/(platform)/operacao/saida/page.tsx` usa `components/exit-operations-client.tsx`.
- Busca real de ticket via `GET /api/tickets/search`.
- Calculo real de saida via `POST /api/operations/exit/calculate`.
- Confirmacao real de saida via `POST /api/operations/exit/confirm`.
- `components/confirm-dialog.tsx` foi ajustado para receber callback, label e estado desabilitado.

### Operacao de entrada

- `app/(platform)/operacao/entrada/page.tsx` usa `components/entry-operations-client.tsx`.
- Registro real de entrada via `POST /api/operations/entry`.
- A tela usa os defaults da unidade ativa para:
  - patio
  - tabela de preco
  - camera
  - terminal

### Dashboard

- `app/(platform)/dashboard/page.tsx` agora usa `components/dashboard-client.tsx`.
- Ainda nao existe endpoint dedicado de dashboard na API.
- O dashboard atual usa:
  - contexto real da sessao
  - indicadores mockados
  - dados visuais mockados para tabela, devices, auditoria e valet

## Arquivos principais alterados

- `apps/api/src/modules/users/users.service.ts`
- `lib/api.ts`
- `components/confirm-dialog.tsx`
- `components/exit-operations-client.tsx`
- `components/entry-operations-client.tsx`
- `components/dashboard-client.tsx`
- `app/(platform)/dashboard/page.tsx`
- `app/(platform)/operacao/entrada/page.tsx`

## Status de validacao

- `npm run api:build` concluiu com sucesso.
- `npm run build` do frontend foi iniciado mais de uma vez, mas interrompido manualmente antes de finalizar.
- Nao foi registrado erro funcional do build web nesta etapa.

## Proximo passo recomendado

Fechar a validacao do frontend e depois escolher uma destas trilhas:

1. Criar endpoint real de dashboard na API.
2. Integrar relatorios e mensalistas ao backend real.
3. Amarrar o frontend ao fluxo do agente local e status de dispositivos em tempo real.

