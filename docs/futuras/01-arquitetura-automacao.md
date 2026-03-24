# Arquitetura de Automacao

## Macro estrutura
```text
Automation Engine
  ├── SLA Engine
  ├── Workflow Engine
  ├── Follow-up Engine
  ├── Scheduler
  └── Event Bus
```

## Estrutura de pastas alvo
```text
src/
  automation/
    engine/
    sla/
    workflow/
    followup/
    scheduler/
    triggers/
    conditions/
    actions/
    templates/
```

## Responsabilidades
- **SLA Engine**: calcula tempos, warning, breach, pause/resume.
- **Workflow Engine**: avalia regras e executa acoes.
- **Follow-up Engine**: comunicacao automatica com controle anti-spam.
- **Scheduler**: processa tarefas temporais.
- **Event Bus**: padroniza eventos internos.

## Regra anti-duplicacao
- `ticketz` core continua dono de ticket, mensagem, contato, fila e socket.
- `automation/*` apenas reage a eventos e executa acoes.
- Nenhuma regra de SLA/Follow-up deve ficar espalhada em controllers.
