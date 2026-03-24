# API Endpoints - SLA e Automacao

## SLA
- `POST /sla` - criar politica SLA
- `PUT /sla/:id` - atualizar politica SLA
- `GET /sla` - listar politicas SLA
- `POST /tickets/:id/sla` - aplicar SLA ao ticket

## Regras de Automacao
- `GET /automation/rules` - listar regras
- `POST /automation/rules` - criar regra
- `PUT /automation/rules/:id` - atualizar regra
- `DELETE /automation/rules/:id` - remover regra

## Templates
- `GET /automation/templates`
- `POST /automation/templates`
- `PUT /automation/templates/:id`
- `DELETE /automation/templates/:id`

## Logs
- `GET /automation/logs`
- `GET /automation/logs/:id`

## Validacoes essenciais
- validar JSON de `conditions_json` e `actions_json`
- permissao admin para alterar regras/politicas
- bloquear webhook em dominios nao permitidos (allowlist)
