# Passo 3 - ComunicaÃ§Ã£o Entre os Blocos

Fluxo principal:

1. `apps/web` conversa com `apps/api`
2. `apps/agent` conversa com `apps/api`
3. `apps/agent` conversa com hardware local
4. `apps/api` persiste no `PostgreSQL`

## Web -> API

Usar `HTTPS` com autenticaÃ§Ã£o por sessÃ£o ou token.

Casos principais:

- login
- consulta de dashboard
- operaÃ§Ã£o de entrada e saÃ­da
- caixa
- mensalistas
- relatÃ³rios
- administraÃ§Ã£o

## Agent -> API

Usar `HTTPS` com credencial da unidade e do agente.

Casos principais:

- sincronizar eventos locais
- receber comandos remotos
- publicar status de dispositivos
- baixar configuraÃ§Ãµes

## Agent -> Hardware Local

O agente encapsula drivers e protocolos locais.

Conectores previstos:

- cancela
- cÃ¢mera IP
- OCR/LPR
- impressora
- totem
- terminal de pagamento

## Modo Offline

Quando a internet cair:

- o agente continua registrando entrada, saÃ­da e eventos
- os dados ficam em fila local
- cada evento recebe `id`, `timestamp`, `unitId`, `deviceId` e `syncStatus`
- ao retornar a conexÃ£o, o agente reenvia em ordem

## Regra importante

Hardware nunca conversa direto com a nuvem.

Sempre:

- hardware -> agente local
- agente local -> API central

Isso simplifica seguranÃ§a, padronizaÃ§Ã£o e operaÃ§Ã£o offline.

