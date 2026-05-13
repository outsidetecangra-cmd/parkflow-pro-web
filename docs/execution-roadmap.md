# Roadmap de Execucao

Ordem sugerida de implementação:

1. consolidar a base `web`
2. estruturar o monorepo alvo
3. definir contratos entre `web`, `api` e `agent`
4. modelar domínio central no banco
5. construir `apps/api`
6. estabilizar fluxo de entrada
7. estabilizar fluxo de saída
8. criar sincronização com agente
9. implementar modo offline
10. expandir ERP, fiscal e relatórios

## Fase 1 - Web

- layout principal
- login
- dashboard
- entrada
- saída

## Fase 2 - API

- autenticação
- RBAC
- unidades
- tickets
- pagamentos

## Fase 3 - Agent

- runtime local
- storage local
- sincronização
- conectores por equipamento

## Fase 4 - Expansão

- fiscal
- mensalistas
- convênios
- auditoria
- valet
- ERP
