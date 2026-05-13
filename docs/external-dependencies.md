# Pendencias Externas

Itens que dependem de definição, fornecedor ou ambiente fora do código:

## Infra

- provisionar PostgreSQL
- definir hospedagem do web
- definir hospedagem da API
- definir estratégia de filas, se necessário

## Segurança

- estratégia de autenticação final
- política de rotação de credenciais do agente
- armazenamento seguro de segredos

## Hardware

- fabricantes e modelos de cancela
- câmeras IP suportadas
- motor OCR/LPR real ou terceirizado
- impressoras térmicas suportadas
- terminais de pagamento suportados
- totem e periféricos

## Fiscal e Pagamentos

- provedor de NFSe/RPS por município
- gateway/adquirente
- Pix
- TEF ou integração de terminal

## Operação Offline

- banco local do agente
- política de retenção offline
- resolução de conflito na sincronização

## Decisões em aberto

- API central em `NestJS` ou `Next.js API`
- tecnologia do agente local: `Node.js`, `Electron`, `Windows Service` ou outro empacotamento
- protocolo de eventos em tempo real: `polling`, `websocket` ou fila
