# Observabilidade e Seguranca

## Observabilidade
- log por regra executada
- log por evento SLA warning/breach
- tempo medio de execucao por regra
- taxa de sucesso/falha por acao
- metricas de auto-close e reabertura

## KPIs no dashboard
- tempo medio de primeira resposta
- tempo medio de resolucao
- taxa de SLA cumprido
- taxa de SLA violado
- tickets fechados automaticamente
- tickets reabertos

## Seguranca
- validar schema de regras (JSON)
- controle de permissao (admin/supervisor)
- limitar webhooks externos (allowlist)
- sanitizar payload de variaveis/template
- auditoria de alteracao de regra e SLA

## Confiabilidade
- retries com backoff para actions externas
- timeout por action
- dead-letter queue para falhas repetidas
- idempotencia por `ruleId + ticketId + eventId`
