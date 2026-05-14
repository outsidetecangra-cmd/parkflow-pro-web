# Pendencias Externas

Itens que dependem de definiÃ§Ã£o, fornecedor ou ambiente fora do cÃ³digo:

## Infra

- provisionar PostgreSQL
- definir hospedagem do web
- definir hospedagem da API
- definir estratÃ©gia de filas, se necessÃ¡rio

## SeguranÃ§a

- estratÃ©gia de autenticaÃ§Ã£o final
- polÃ­tica de rotaÃ§Ã£o de credenciais do agente
- armazenamento seguro de segredos

## Hardware

- fabricantes e modelos de cancela
- cÃ¢meras IP suportadas
- motor OCR/LPR real ou terceirizado
- impressoras tÃ©rmicas suportadas
- terminais de pagamento suportados
- totem e perifÃ©ricos

## Fiscal e Pagamentos

- provedor de NFSe/RPS por municÃ­pio
- gateway/adquirente
- Pix
- TEF ou integraÃ§Ã£o de terminal

## OperaÃ§Ã£o Offline

- banco local do agente
- polÃ­tica de retenÃ§Ã£o offline
- resoluÃ§Ã£o de conflito na sincronizaÃ§Ã£o

## DecisÃµes em aberto

- API central em `NestJS` ou `Next.js API`
- tecnologia do agente local: `Node.js`, `Electron`, `Windows Service` ou outro empacotamento
- protocolo de eventos em tempo real: `polling`, `websocket` ou fila

