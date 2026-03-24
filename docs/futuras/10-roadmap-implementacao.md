# Roadmap de Implementacao

## Sprint 1 - Fundacao (MVP)
- Event Bus padrao
- SLA policy + timers
- Follow-up pending timeout
- logs de automacao
- endpoints basicos SLA

## Sprint 2 - Workflow
- engine trigger/condition/action
- scheduler consolidado
- templates de mensagem
- regras padrao (saudacao, fila cheia, inatividade)

## Sprint 3 - Escala e Integracoes
- dashboard de KPI SLA
- simulador de regra (dry-run)
- integração Typebot/Botpress via adapter
- hardening de seguranca e observabilidade

## Criterios de aceite globais
- nenhuma regra duplicada no core
- todos os disparos com log auditavel
- automacao executada em background
- rollback simples (desativar regra/politica)
