# Event Bus - Contrato de Eventos

## Objetivo
Padronizar eventos para desacoplar core, SLA, workflow, follow-up e integrações externas.

## Eventos monitorados
- `ticket_created`
- `ticket_assigned`
- `ticket_status_changed`
- `message_received_customer`
- `message_sent_agent`
- `ticket_resolved`
- `ticket_closed`
- `ticket_reopened`
- `queue_changed`
- `agent_changed`
- `sla_*`

## Payload minimo
```json
{
  "event": "ticket_status_changed",
  "companyId": 1,
  "ticketId": 123,
  "contactId": 456,
  "queueId": 7,
  "status": "pending",
  "timestamp": "2026-03-23T18:00:00.000Z",
  "source": "tickets-service"
}
```

## Regras
- Eventos devem ser idempotentes
- Mensagens devem carregar `correlationId` para rastreio
- Consumidores nao devem depender de ordem global
