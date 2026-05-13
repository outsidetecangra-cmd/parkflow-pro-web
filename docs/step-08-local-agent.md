# Passo 8 - Agente Local

Objetivo deste passo:

- preparar a base do `apps/agent`
- definir runtime local, fila offline e conectores
- deixar o sistema pronto para integrar hardware depois

## Decisao

O agente local sera um servico `Node.js + TypeScript`.

Motivo:

- mais simples para rodar como processo local
- mais leve que `Electron`
- suficiente para hardware, fila e sincronizacao
- bom ponto de partida para empacotamento posterior

## Responsabilidades do agente

- autenticar na API central
- manter contexto da unidade
- registrar eventos locais
- guardar fila offline
- sincronizar lotes quando houver internet
- atualizar status de dispositivos
- expor conectores para hardware

## Blocos internos

- `config`
- `runtime`
- `storage`
- `sync`
- `connectors`
- `types`

## Decisao de storage local

Primeira versao:

- arquivo JSON local para fila e estado

Depois, se necessario:

- SQLite

Isso evita complexidade cedo demais.

## Conectores previstos

- `camera`
- `gate`
- `ocr`
- `printer`
- `terminal`
- `totem`

## Entregavel deste passo

- pasta `apps/agent`
- configuracao base
- runtime principal
- storage offline
- cliente de sincronizacao
- contratos de conectores

## Proximo passo apos este

- plugar o agente no fluxo de autenticacao e envio real para a API
