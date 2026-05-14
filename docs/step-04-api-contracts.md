# Passo 4 - Contratos Iniciais de API e Sincronizacao

Objetivo deste passo:

- definir os contratos minimos para destravar `web`, `api` e `agent`
- evitar modelar tudo de uma vez
- priorizar login, entrada, saida, eventos de dispositivo e fila offline

## Escopo inicial

Contratos obrigatorios da primeira fase:

1. autenticacao
2. contexto da unidade
3. consulta de ticket
4. registrar entrada
5. calcular saida
6. confirmar saida
7. publicar evento do agente
8. sincronizar fila offline
9. status de dispositivos

## Padrao base de resposta

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket nao encontrado"
  }
}
```

## 1. Autenticacao

### `POST /auth/login`

Uso:

- login do sistema web

Request:

```json
{
  "login": "admin.demo@example.invalid",
  "password": "******"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "usr_01",
      "name": "Admin Demo",
      "role": "ADMIN",
      "allowedUnitIds": ["unit_01", "unit_02"]
    }
  }
}
```

### `POST /auth/agent/login`

Uso:

- autenticacao do agente local

Request:

```json
{
  "agentKey": "troque-este-segredo",
  "unitCode": "ATL",
  "deviceName": "agent-atl-01"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "agent-jwt-token",
    "agent": {
      "id": "agt_01",
      "unitId": "unit_01",
      "name": "agent-atl-01"
    }
  }
}
```

## 2. Contexto da Unidade

### `GET /me/context`

Uso:

- carregar unidade atual, permissoes e preferencias operacionais

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_01",
      "name": "Joana Alves",
      "role": "CASHIER"
    },
    "activeUnit": {
      "id": "unit_01",
      "name": "Shopping Atlante"
    },
    "permissions": [
      "ticket.entry.create",
      "ticket.exit.confirm",
      "cash.open"
    ]
  }
}
```

## 3. Consulta de Ticket

### `GET /tickets/search`

Query params suportados:

- `ticketCode`
- `plate`
- `qrCode`

Uso:

- operador consulta ticket antes da saida
- totem e app cliente podem reutilizar depois

Response:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "tkt_01",
      "code": "TK-20260513-001",
      "status": "OPEN",
      "type": "AVULSO",
      "plate": "DEMO001",
      "vehicleModel": "Jeep Compass",
      "customerName": "Marina Costa",
      "entryAt": "2026-05-13T09:15:00-03:00",
      "yardName": "P1 Shopping",
      "spotCode": "A-18",
      "priceTableName": "Avulso Premium",
      "paymentStatus": "PENDING",
      "validationStatus": "NOT_VALIDATED"
    }
  }
}
```

## 4. Registrar Entrada

### `POST /operations/entry`

Uso:

- operador web
- agente local quando a entrada vier da automacao

Request:

```json
{
  "unitId": "unit_01",
  "origin": "WEB",
  "plate": "DEMO001",
  "vehicleModel": "Jeep Compass",
  "vehicleColor": "Preto",
  "customerType": "AVULSO",
  "yardId": "yard_01",
  "spotCode": "A-18",
  "priceTableId": "price_01",
  "terminalId": "term_01",
  "cameraId": "cam_01",
  "lpr": {
    "plate": "DEMO001",
    "confidence": 97.8
  },
  "notes": "Entrada registrada com OCR"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "tkt_01",
      "code": "TK-20260513-001",
      "status": "OPEN",
      "entryAt": "2026-05-13T09:15:00-03:00"
    },
    "gateAction": {
      "allowed": true,
      "reason": null
    }
  }
}
```

Regras minimas:

- uma placa nao pode abrir duas entradas simultaneas sem regra explicita
- mensalista inadimplente retorna alerta ou bloqueio
- credencial vencida retorna bloqueio

## 5. Calcular Saida

### `POST /operations/exit/calculate`

Uso:

- mostrar permanencia, valor e regras antes do pagamento

Request:

```json
{
  "ticketCode": "TK-20260513-001",
  "exitAt": "2026-05-13T12:40:00-03:00",
  "couponCode": null,
  "partnerValidationCode": null
}
```

Response:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "code": "TK-20260513-001",
      "status": "OPEN",
      "stayMinutes": 205
    },
    "pricing": {
      "originalAmount": 32,
      "discountAmount": 4,
      "extraAmount": 0,
      "finalAmount": 28,
      "appliedRules": [
        "1a hora",
        "3 fracoes",
        "convenio parceiro gold"
      ]
    },
    "alerts": [
      {
        "code": "LPR_MISMATCH",
        "message": "Leitura de placa divergente na saida"
      }
    ]
  }
}
```

## 6. Confirmar Saida

### `POST /operations/exit/confirm`

Uso:

- finalizar pagamento e liberar saida

Request:

```json
{
  "ticketCode": "TK-20260513-001",
  "unitId": "unit_01",
  "exitAt": "2026-05-13T12:40:00-03:00",
  "payment": {
    "method": "PIX",
    "amount": 28,
    "status": "APPROVED",
    "reference": "pix_123"
  },
  "discount": {
    "amount": 4,
    "reason": "Convenio parceiro gold"
  },
  "lpr": {
    "plate": "BRA2E18",
    "confidence": 78.2
  },
  "gateId": "gate_02"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "code": "TK-20260513-001",
      "status": "PAID",
      "finalAmount": 28
    },
    "gateAction": {
      "allowed": true,
      "command": "OPEN"
    },
    "audit": {
      "occurrenceCreated": true,
      "reason": "LPR_MISMATCH"
    }
  }
}
```

Regras minimas:

- sem pagamento, isencao, mensalista valido ou credencial valida, a saida nao confirma
- desconto fora da permissao retorna erro
- divergencia de LPR nao precisa travar sempre, mas deve gerar ocorrencia configuravel

## 7. Evento de Dispositivo

### `POST /agent/events`

Uso:

- agente publica eventos do hardware para a API

Request:

```json
{
  "eventId": "evt_001",
  "unitId": "unit_01",
  "agentId": "agt_01",
  "deviceId": "cam_01",
  "deviceType": "CAMERA",
  "eventType": "LPR_CAPTURED",
  "occurredAt": "2026-05-13T12:39:41-03:00",
  "payload": {
    "plate": "BRA2E18",
    "confidence": 78.2,
    "imageUrl": "local://capture-001.jpg"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accepted": true,
    "eventId": "evt_001"
  }
}
```

## 8. Sincronizacao Offline

### `POST /agent/sync/batch`

Uso:

- reenviar eventos acumulados offline

Request:

```json
{
  "agentId": "agt_01",
  "unitId": "unit_01",
  "batchId": "batch_20260513_001",
  "events": [
    {
      "eventId": "evt_001",
      "eventType": "TICKET_ENTRY_CREATED",
      "occurredAt": "2026-05-13T09:15:00-03:00",
      "payload": {
        "ticketCode": "TK-20260513-001",
        "plate": "DEMO001"
      }
    },
    {
      "eventId": "evt_002",
      "eventType": "LPR_CAPTURED",
      "occurredAt": "2026-05-13T09:15:10-03:00",
      "payload": {
        "plate": "DEMO001",
        "confidence": 97.8
      }
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "batchId": "batch_20260513_001",
    "processed": 2,
    "failed": 0,
    "results": [
      { "eventId": "evt_001", "status": "PROCESSED" },
      { "eventId": "evt_002", "status": "PROCESSED" }
    ]
  }
}
```

Regras minimas:

- `eventId` deve ser idempotente
- a API deve aceitar reenvio sem duplicar efeitos
- a ordem do lote importa para eventos dependentes

## 9. Status de Dispositivos

### `POST /agent/devices/status`

Uso:

- heartbeat dos equipamentos da unidade

Request:

```json
{
  "agentId": "agt_01",
  "unitId": "unit_01",
  "sentAt": "2026-05-13T12:50:00-03:00",
  "devices": [
    {
      "deviceId": "gate_01",
      "deviceType": "GATE",
      "status": "ONLINE",
      "lastSignalAt": "2026-05-13T12:49:57-03:00"
    },
    {
      "deviceId": "cam_01",
      "deviceType": "CAMERA",
      "status": "OFFLINE",
      "lastSignalAt": "2026-05-13T12:17:00-03:00"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "received": 2
  }
}
```

## Eventos de dominio iniciais

Eventos que ja valem a pena padronizar:

- `TICKET_ENTRY_CREATED`
- `TICKET_EXIT_CALCULATED`
- `TICKET_EXIT_CONFIRMED`
- `PAYMENT_APPROVED`
- `LPR_CAPTURED`
- `GATE_OPENED`
- `GATE_BLOCKED`
- `DEVICE_OFFLINE`
- `AUDIT_OCCURRENCE_CREATED`

## Campos tecnicos obrigatorios em eventos

Todo evento do agente deve ter:

- `eventId`
- `eventType`
- `unitId`
- `agentId`
- `deviceId` quando aplicavel
- `occurredAt`
- `payload`

## Decisao de implementacao

Primeira versao:

- REST para tudo
- sem websocket no inicio
- sincronizacao por `batch`

Isso reduz complexidade e acelera a entrega.

Quando a operacao estiver estavel, podemos avaliar:

- websocket para eventos em tempo real
- fila dedicada
- comandos remotos assinos

