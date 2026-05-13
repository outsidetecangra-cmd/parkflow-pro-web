# Passo 2 - Arquitetura do Repositório

Estrutura alvo do monorepo:

- `apps/web`
- `apps/api`
- `apps/agent`
- `packages/shared`
- `packages/ui`
- `packages/config`

Responsabilidades:

## `apps/web`

- login
- dashboard
- operação web
- mensalistas
- financeiro
- relatórios
- administração

Estado atual:

- o esqueleto já existente neste repositório representa o futuro `apps/web`

## `apps/api`

- autenticação
- RBAC
- tickets
- pagamentos
- fiscal
- automação
- sincronização com agente local
- multiunidade

## `apps/agent`

- integração local com hardware
- fila offline
- sincronização com a nuvem
- ponte com cancela, câmera, OCR, impressora, totem e terminal

## `packages/shared`

- tipos compartilhados
- contratos de API
- enums de domínio
- validações reaproveitáveis

## `packages/ui`

- design system interno
- componentes comuns do web

## `packages/config`

- `tsconfig`
- lint
- presets internos
