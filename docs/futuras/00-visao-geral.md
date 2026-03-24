# Visao Geral - Programa de Evolucao Omnichannel

## Objetivo
Implementar um modulo unificado de automacao para o `ticketz`, cobrindo:
- SLA (tempo e violacao)
- Follow-up (mensagens automaticas)
- Workflow (trigger -> condition -> action)
- Scheduler (execucao assicrona em background)
- Event Bus (arquitetura orientada a eventos)

## Fontes de referencia
- `ticketz` (base principal)
- `izing.open.io` (features operacionais)
- `chatwoot` (UX e fluxo de agente)
- `typebot.io` (builder de fluxos)
- `botpress` (orquestracao e IA)

## Principios de implementacao
- Nao duplicar funcionalidades estaveis ja existentes no `ticketz`
- Nao acoplar regra de automacao em controller de canal
- Nao executar automacao pesada em request HTTP
- Toda automacao precisa de log, auditoria e opcao de desativacao
- Todo modulo novo deve ser orientado por eventos

## Resultado esperado
- Maior previsibilidade operacional
- Menos tickets esquecidos
- Resposta mais rapida e com melhor qualidade
- Menor retrabalho em manutencao
