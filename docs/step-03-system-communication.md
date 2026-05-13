# Passo 3 - Comunicação Entre os Blocos

Fluxo principal:

1. `apps/web` conversa com `apps/api`
2. `apps/agent` conversa com `apps/api`
3. `apps/agent` conversa com hardware local
4. `apps/api` persiste no `PostgreSQL`

## Web -> API

Usar `HTTPS` com autenticação por sessão ou token.

Casos principais:

- login
- consulta de dashboard
- operação de entrada e saída
- caixa
- mensalistas
- relatórios
- administração

## Agent -> API

Usar `HTTPS` com credencial da unidade e do agente.

Casos principais:

- sincronizar eventos locais
- receber comandos remotos
- publicar status de dispositivos
- baixar configurações

## Agent -> Hardware Local

O agente encapsula drivers e protocolos locais.

Conectores previstos:

- cancela
- câmera IP
- OCR/LPR
- impressora
- totem
- terminal de pagamento

## Modo Offline

Quando a internet cair:

- o agente continua registrando entrada, saída e eventos
- os dados ficam em fila local
- cada evento recebe `id`, `timestamp`, `unitId`, `deviceId` e `syncStatus`
- ao retornar a conexão, o agente reenvia em ordem

## Regra importante

Hardware nunca conversa direto com a nuvem.

Sempre:

- hardware -> agente local
- agente local -> API central

Isso simplifica segurança, padronização e operação offline.
