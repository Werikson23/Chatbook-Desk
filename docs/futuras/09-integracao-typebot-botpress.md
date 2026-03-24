# Integracao Typebot e Botpress (Sem Acoplamento)

## Objetivo
Extrair o melhor de `typebot.io` e `botpress` sem substituir o core do `ticketz`.

## Typebot - o que extrair
- Builder visual de fluxo (nos e conexoes)
- Reuso de blocos
- Variaveis de sessao
- Preview/simulacao antes de publicar

## Botpress - o que extrair
- Orquestracao de fluxo com estado
- Actions externas e webhooks
- Estrategia de fallback
- Observabilidade de execucao

## Regra de integracao
- `ticketz` continua como source of truth de ticket/mensagem/contato
- Typebot e Botpress entram como adapters por evento/acao
- Nenhum canal deve depender diretamente de SDK externo no controller

## Plano tecnico
- adapter `automation/actions/webhook.ts`
- adapter `automation/actions/invokeTypebot.ts` (fase 2)
- adapter `automation/actions/invokeBotpress.ts` (fase 2)
- retries, timeout e circuit breaker para chamadas externas
