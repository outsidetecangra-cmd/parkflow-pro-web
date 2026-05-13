# Passo 6 - Refactor Planejado do Prisma

Objetivo deste passo:

- definir exatamente o que deve mudar em `prisma/schema.prisma`
- reduzir risco antes de editar o schema real
- preparar a futura migration por blocos

## Estado atual

O schema atual ja cobre bem:

- autenticacao basica
- unidades e patios
- tickets e pagamentos
- equipamentos
- OCR/LPR
- auditoria

O que falta para a arquitetura aprovada:

- multiunidade real por usuario
- agente local
- eventos do agente
- sincronizacao offline
- `unitId` direto nas entidades operacionais criticas

## Mudancas planejadas

### Bloco 1 - Multiunidade de usuario

Problema atual:

- `User` aponta para apenas uma `Unit`

Mudanca:

- manter `unitId` em `User` apenas se quiser usar como unidade ativa padrao
- criar tabela `UserUnitAccess`

Modelo alvo:

- `User`
- `Unit`
- `UserUnitAccess`

Campos recomendados em `UserUnitAccess`:

- `id`
- `userId`
- `unitId`
- `isDefault`
- `createdAt`

Regra:

- par `userId + unitId` deve ser unico

### Bloco 2 - Ticket mais operacional

Problema atual:

- `Ticket` depende de `ParkingLot` para saber a unidade
- falta `origin`

Mudanca:

- adicionar `unitId`
- adicionar `origin`
- opcionalmente adicionar `qrCode`

Campos a adicionar em `Ticket`:

- `unitId String?`
- `origin String?`
- `qrCode String?`

Relacao:

- `unit Unit? @relation(...)`

Indice recomendado:

- `@@index([unitId, status])`
- `@@index([vehicleId, status])`

### Bloco 3 - Payment com contexto operacional

Problema atual:

- `Payment` nao carrega unidade direto
- falta origem e momento de pagamento

Mudanca:

- adicionar `unitId`
- adicionar `origin`
- adicionar `paidAt`

Campos a adicionar em `Payment`:

- `unitId String?`
- `origin String?`
- `paidAt DateTime?`

Relacao:

- `unit Unit? @relation(...)`

Indice recomendado:

- `@@index([unitId, createdAt])`

### Bloco 4 - LPR mais rastreavel

Problema atual:

- `LprCapture` nao tem `unitId` direto
- depende de `Camera` ou `Ticket` para contexto

Mudanca:

- adicionar `unitId`

Campos a adicionar em `LprCapture`:

- `unitId String?`

Relacao:

- `unit Unit? @relation(...)`

Indice recomendado:

- `@@index([unitId, createdAt])`
- `@@index([plate, createdAt])`

### Bloco 5 - Caixa com contexto direto

Problema atual:

- `CashTransaction` depende de `CashRegister` para achar a unidade

Mudanca recomendada:

- adicionar `unitId` em `CashTransaction`

Campos:

- `unitId String?`

Relacao:

- `unit Unit? @relation(...)`

Indice recomendado:

- `@@index([unitId, createdAt])`

### Bloco 6 - Agente local

Entidade nova:

- `Agent`

Campos recomendados:

- `id`
- `unitId`
- `name`
- `agentKeyHash`
- `status`
- `version`
- `lastSeenAt`
- `createdAt`
- `updatedAt`

Relacoes:

- `Unit -> Agent`
- `Agent -> AgentDevice`
- `Agent -> AgentEvent`
- `Agent -> SyncBatch`

Indices:

- `name` unico por unidade
- `@@index([unitId, status])`

### Bloco 7 - Dispositivos do agente

Entidade nova:

- `AgentDevice`

Campos recomendados:

- `id`
- `agentId`
- `unitId`
- `deviceType`
- `name`
- `externalIdentifier`
- `status`
- `lastSignalAt`
- `metadata`
- `createdAt`
- `updatedAt`

Regra:

- `externalIdentifier` nao precisa ser globalmente unico
- deve ser unico dentro do agente ou da unidade conforme o hardware real

Indice recomendado:

- `@@unique([agentId, externalIdentifier])`
- `@@index([unitId, status])`

### Bloco 8 - Eventos do agente

Entidade nova:

- `AgentEvent`

Campos recomendados:

- `id`
- `eventId`
- `agentId`
- `unitId`
- `agentDeviceId`
- `eventType`
- `occurredAt`
- `payload`
- `processingStatus`
- `processedAt`
- `createdAt`

Regras:

- `eventId` unico
- payload em `Json`

Indices:

- `@unique` em `eventId`
- `@@index([unitId, eventType, occurredAt])`
- `@@index([agentId, processingStatus])`

### Bloco 9 - Sincronizacao offline

Entidades novas:

- `SyncBatch`
- `SyncBatchItem`

`SyncBatch` campos:

- `id`
- `batchId`
- `agentId`
- `unitId`
- `sentAt`
- `processedAt`
- `status`
- `createdAt`

`SyncBatchItem` campos:

- `id`
- `syncBatchId`
- `agentEventId`
- `eventId`
- `status`
- `errorCode`
- `errorMessage`
- `createdAt`

Regras:

- `batchId` unico por agente
- `eventId` precisa ser rastreavel mesmo quando o item falhar

Indices:

- `@@unique([agentId, batchId])` em `SyncBatch`
- `@@index([syncBatchId, status])` em `SyncBatchItem`

### Bloco 10 - Heartbeat e comandos

Para nao inflar cedo demais:

- `DeviceHeartbeat` nao precisa virar tabela separada agora
- podemos usar `AgentDevice.lastSignalAt` para o primeiro ciclo
- `DeviceCommand` tambem pode esperar

Decisao:

- primeira versao sem `DeviceCommand`
- primeira versao sem tabela historica de heartbeat

## Ordem recomendada de implementacao no schema

Aplicar em 4 ondas:

1. ajustes de `unitId` e `origin` nas tabelas existentes
2. multiunidade de usuario
3. entidades do agente
4. sincronizacao offline

Essa ordem reduz impacto porque:

- primeiro estabiliza operacao e filtros
- depois resolve acesso
- depois adiciona infraestrutura do agente

## Lista objetiva de alteracoes no schema atual

Adicionar:

- `UserUnitAccess`
- `Agent`
- `AgentDevice`
- `AgentEvent`
- `SyncBatch`
- `SyncBatchItem`

Alterar:

- `User`
- `Unit`
- `Ticket`
- `Payment`
- `LprCapture`
- `CashTransaction`

## Campos que devem entrar na proxima edicao do Prisma

### Em `User`

- revisar `unitId` como unidade padrao, nao como unica unidade permitida
- adicionar relacao com `UserUnitAccess`

### Em `Unit`

- adicionar relacoes:
  - `userAccesses`
  - `agents`
  - `agentDevices`
  - `agentEvents`
  - `syncBatches`

### Em `Ticket`

- adicionar `unitId`
- adicionar `origin`
- opcional `qrCode`

### Em `Payment`

- adicionar `unitId`
- adicionar `origin`
- adicionar `paidAt`

### Em `LprCapture`

- adicionar `unitId`

### Em `CashTransaction`

- adicionar `unitId`

## O que ainda nao vamos fazer no schema

- modelar todos os fabricantes de hardware
- criar fila fiscal completa
- detalhar ERP inteiro
- criar tabela de comando remoto se ainda nao houver consumo real

## Decisao pratica

No proximo passo podemos finalmente editar `prisma/schema.prisma`.

A meta da primeira revisao deve ser:

1. multiunidade correta
2. operacao com `unitId` direto
3. agente local representado
4. sincronizacao offline registrada
