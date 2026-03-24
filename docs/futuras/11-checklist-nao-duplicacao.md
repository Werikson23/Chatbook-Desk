# Checklist Anti-Duplicacao

Use este checklist para cada funcionalidade nova:

1. Ja existe no `ticketz`?
2. Se existe, esta estavel em producao?
3. Deve ser reutilizada, refatorada ou descartada?
4. A logica esta espalhada em mais de um modulo?
5. O comportamento pode virar evento padrao?
6. Existe log/auditoria para a automacao?
7. Existe feature flag para desligar rapidamente?
8. Existe teste do fluxo principal e do fallback?

## Regra de decisao
- existe + estavel -> manter e integrar
- existe + fragil -> refatorar
- nao existe + alto valor -> implementar
- nao existe + baixo valor -> backlog
