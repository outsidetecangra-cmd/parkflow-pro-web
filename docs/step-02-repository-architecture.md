# Passo 2 - Arquitetura do RepositÃ³rio

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
- operaÃ§Ã£o web
- mensalistas
- financeiro
- relatÃ³rios
- administraÃ§Ã£o

Estado atual:

- o esqueleto jÃ¡ existente neste repositÃ³rio representa o futuro `apps/web`

## `apps/api`

- autenticaÃ§Ã£o
- RBAC
- tickets
- pagamentos
- fiscal
- automaÃ§Ã£o
- sincronizaÃ§Ã£o com agente local
- multiunidade

## `apps/agent`

- integraÃ§Ã£o local com hardware
- fila offline
- sincronizaÃ§Ã£o com a nuvem
- ponte com cancela, cÃ¢mera, OCR, impressora, totem e terminal

## `packages/shared`

- tipos compartilhados
- contratos de API
- enums de domÃ­nio
- validaÃ§Ãµes reaproveitÃ¡veis

## `packages/ui`

- design system interno
- componentes comuns do web

## `packages/config`

- `tsconfig`
- lint
- presets internos

