# Modelagem de Banco - Automacao

## Tabela `sla_policy`
- id (uuid/pk)
- name
- priority
- first_response_time
- reply_time
- resolution_time
- pending_timeout
- queue_timeout
- auto_close
- auto_close_after
- reopen_window
- business_hours_only
- created_at
- updated_at

## Tabela `sla_timer`
- id
- ticket_id
- sla_type
- started_at
- paused_at
- deadline_at
- status

## Tabela `automation_rules`
- id
- name
- active
- trigger_type
- trigger_value
- conditions_json (jsonb)
- actions_json (jsonb)
- created_at
- updated_at

## Tabela `automation_logs`
- id
- rule_id
- ticket_id
- executed_at
- status
- error
- metadata (jsonb)

## Tabela `message_templates`
- id
- name
- channel
- content
- variables (jsonb)
