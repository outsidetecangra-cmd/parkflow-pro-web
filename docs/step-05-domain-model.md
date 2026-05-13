# Passo 5 - Modelo de Dominio Inicial

Objetivo deste passo:

- definir o nucleo do banco para suportar os contratos do passo 4
- separar o que entra agora do que pode esperar
- preparar `web`, `api` e `agent` sem inflar o schema cedo demais

## Regra de modelagem

Primeiro banco para operar:

- autenticacao
- multiunidade
- entrada
- saida
- pagamento
- dispositivos
- eventos do agente
- sincronizacao offline

Ainda nao e prioridade de modelagem profunda:

- ERP completo
- fiscal completo
- estoque detalhado
- RH
- convenios avancados
- selos complexos

## Agregados principais da fase 1

### 1. Acesso e autorizacao

Entidades:

- `User`
- `Role`
- `Permission`
- `UserUnitAccess`
- `Session` ou `RefreshToken`

Observacao:

- o schema atual ja tem `User`, `Role` e `Permission`
- ainda falta uma tabela clara para acesso do mesmo usuario a varias unidades

Decisao:

- nao limitar usuario a uma unica unidade
- criar relacao de muitos para muitos entre usuario e unidade

### 2. Estrutura operacional

Entidades:

- `Unit`
- `ParkingLot`
- `ParkingSector`
- `ParkingSpot`

Observacao:

- esse bloco ja esta parcialmente coberto no schema atual

### 3. Cadastro operacional

Entidades:

- `Customer`
- `Vehicle`
- `MonthlyCustomer`
- `Credential`

Observacao:

- esse bloco ja existe no schema atual e atende a fase 1

### 4. Precos e regras

Entidades:

- `PriceTable`
- `PriceRule`

Observacao:

- esse bloco ja existe no schema atual

### 5. Operacao de ticket

Entidades:

- `Ticket`
- `TicketImage`
- `Movement`

Campos minimos obrigatorios no `Ticket`:

- `code`
- `unitId`
- `parkingLotId`
- `vehicleId`
- `customerId`
- `priceTableId`
- `status`
- `entryAt`
- `exitAt`
- `expectedAmount`
- `finalAmount`
- `paymentDeadline`
- `origin`

Ponto importante:

- o schema atual liga `Ticket` ao `ParkingLot`, mas nao tem `unitId` direto
- recomendacao: adicionar `unitId` direto no ticket

### 6. Pagamentos e caixa

Entidades:

- `Payment`
- `CashRegister`
- `CashTransaction`

Campos minimos importantes em `Payment`:

- `ticketId`
- `unitId`
- `method`
- `amount`
- `status`
- `reference`
- `paidAt`
- `origin`

Ponto importante:

- `Payment` no schema atual ainda nao carrega `unitId` direto
- recomendacao: adicionar `unitId`

### 7. Dispositivos e automacao

Entidades:

- `Gate`
- `Camera`
- `Terminal`
- `DeviceCommand`
- `DeviceHeartbeat`

Observacao:

- o schema atual ja tem `Gate`, `Camera` e `Terminal`
- ainda faltam entidades especificas para heartbeat e comando

### 8. OCR/LPR e auditoria

Entidades:

- `LprCapture`
- `AuditOccurrence`

Observacao:

- esse bloco ja existe no schema atual

### 9. Agente local e sincronizacao

Entidades novas recomendadas:

- `Agent`
- `AgentDevice`
- `AgentEvent`
- `SyncBatch`
- `SyncBatchItem`

Essas entidades sao prioridade real para a arquitetura escolhida.

## Entidades novas recomendadas para a fase 1

### `UserUnitAccess`

Campos minimos:

- `id`
- `userId`
- `unitId`
- `isDefault`
- `createdAt`

### `Agent`

Campos minimos:

- `id`
- `unitId`
- `name`
- `agentKeyHash`
- `status`
- `lastSeenAt`
- `version`
- `createdAt`

### `AgentDevice`

Campos minimos:

- `id`
- `agentId`
- `unitId`
- `deviceType`
- `name`
- `externalIdentifier`
- `status`
- `lastSignalAt`
- `metadata`

### `AgentEvent`

Campos minimos:

- `id`
- `eventId`
- `agentId`
- `unitId`
- `deviceId`
- `eventType`
- `occurredAt`
- `payload`
- `processedAt`
- `processingStatus`

Regra:

- `eventId` deve ser unico

### `SyncBatch`

Campos minimos:

- `id`
- `batchId`
- `agentId`
- `unitId`
- `sentAt`
- `processedAt`
- `status`

### `SyncBatchItem`

Campos minimos:

- `id`
- `syncBatchId`
- `eventId`
- `status`
- `errorCode`
- `errorMessage`

## Relacoes essenciais

- `User <-> Unit` muitos para muitos via `UserUnitAccess`
- `Unit -> ParkingLot`
- `ParkingLot -> ParkingSector`
- `ParkingLot -> ParkingSpot`
- `Customer -> Vehicle`
- `Vehicle -> Ticket`
- `Ticket -> Payment`
- `Ticket -> Movement`
- `Ticket -> TicketImage`
- `Ticket -> LprCapture`
- `Unit -> Gate`
- `Unit -> Camera`
- `Unit -> Terminal`
- `Unit -> Agent`
- `Agent -> AgentDevice`
- `Agent -> AgentEvent`
- `Agent -> SyncBatch`
- `SyncBatch -> SyncBatchItem`

## Regras de negocio que precisam refletir no banco

- ticket com `code` unico
- placa pode ter no maximo uma entrada aberta, salvo regra especial
- `eventId` do agente deve ser unico
- tudo que for operacional precisa carregar `unitId` de forma clara

Entidades que devem ter `unitId` direto:

- `Ticket`
- `Payment`
- `CashRegister`
- `CashTransaction`
- `AuditOccurrence`
- `LprCapture`
- `Agent`
- `AgentDevice`
- `AgentEvent`
- `SyncBatch`

## O que o schema atual ja atende

- usuarios
- papeis
- unidades
- patios
- vagas
- clientes
- mensalistas
- credenciais
- tabelas de preco
- tickets
- pagamentos
- caixa
- equipamentos
- capturas LPR
- ocorrencias de auditoria

## O que falta no schema atual para encaixar a arquitetura escolhida

Prioridade alta:

- `UserUnitAccess`
- `Agent`
- `AgentDevice`
- `AgentEvent`
- `SyncBatch`
- `SyncBatchItem`

Ajustes importantes:

- adicionar `unitId` direto em `Ticket`
- adicionar `unitId` direto em `Payment`
- adicionar `unitId` direto em `LprCapture`
- considerar `origin` em `Ticket` e `Payment`
- considerar `processedAt` e `processingStatus` em eventos do agente

## Decisao pratica para o proximo passo

Antes de expandir funcionalidades, o schema Prisma deve ser revisado para:

1. corrigir multiunidade operacional
2. incluir o agente local
3. incluir sincronizacao offline
4. manter o restante simplificado
