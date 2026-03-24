# Follow-up Engine - Especificacao

## Finalidade
Executar comunicacao automatica com cliente sem gerar spam.

## Casos padrao
- Cliente sem resposta apos `agent_replied`
- Ticket em `pending` por tempo limite
- Alta demanda/fila cheia
- Pos-atendimento com pesquisa de satisfacao

## Sequencia recomendada (pending)
- 30 min: lembrete 1
- 2 horas: lembrete 2
- 24 horas: aviso final
- 48 horas: fechamento automatico

## Mensagens padrao
- aguardando cliente
- aviso de encerramento
- encerramento por inatividade
- alta demanda

## Regras de seguranca operacional
- parar follow-up ao receber resposta do cliente
- limitar tentativas por janela
- respeitar horario comercial quando configurado
- registrar logs de envio e cancelamento
