# SLA - Especificacao Tecnica

## Escopo
Controle de tempo com automacoes para:
- primeira resposta
- resposta entre mensagens
- resolucao
- pending/espera/inatividade
- fechamento e reabertura automatica

## Tipos de SLA
- First Response Time (FRT)
- Reply Time SLA
- Resolution Time (TTR)
- Pending Timeout SLA
- Queue Time SLA
- Idle Ticket SLA

## Status do ticket e efeito no SLA
- ativos: `waiting`, `open`, `in_progress`
- pausados: `pending`, `snoozed`
- encerrados: `resolved`, `closed`

## Eventos SLA padrao
- `sla_first_response_warning`
- `sla_first_response_breached`
- `sla_reply_warning`
- `sla_reply_breached`
- `sla_resolution_warning`
- `sla_resolution_breached`
- `sla_pending_timeout_warning`
- `sla_pending_timeout_breached`

## Politicas padrao por prioridade
- baixa: FRT 30m, reply 20m, pending 48h, resolucao 72h
- normal: FRT 15m, reply 10m, pending 24h, resolucao 24h
- alta: FRT 5m, reply 5m, pending 12h, resolucao 8h
- urgente: FRT 2m, reply 2m, pending 2h, resolucao 1h

## Regras obrigatorias
- lembrar cliente antes de fechamento automatico
- permitir reabertura em janela configuravel
- registrar cada trigger/acao em log
- permitir override manual de supervisor
