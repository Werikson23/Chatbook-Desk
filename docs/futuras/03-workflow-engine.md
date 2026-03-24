# Workflow Engine - Especificacao

## Modelo
`Trigger -> Conditions -> Actions`

## Triggers
- `ticket_created`
- `ticket_updated`
- `ticket_assigned`
- `ticket_status_changed`
- `message_received_customer`
- `message_sent_agent`
- `ticket_reopened`
- `queue_changed`
- `sla_*`

## Conditions
- canal
- fila
- tag
- prioridade
- idioma
- horario comercial
- numero de mensagens
- contato VIP

## Actions
- `send_message`
- `add_tag`
- `remove_tag`
- `assign_agent`
- `change_priority`
- `move_queue`
- `close_ticket`
- `open_ticket`
- `webhook`
- `delay`

## Exemplo de regra (JSON)
```json
{
  "name": "followup cliente parado",
  "trigger": { "type": "agent_replied" },
  "conditions": [
    { "field": "channel", "operator": "equals", "value": "whatsapp" }
  ],
  "actions": [
    { "type": "delay", "value": 30 },
    { "type": "send_message", "template_id": "followup_1" }
  ]
}
```
