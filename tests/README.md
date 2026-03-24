# Testes

- **Backend (unitário / integração):** os testes Jest ficam junto do código em `backend/src` (padrão do projeto) e são executados com `npm test` dentro da pasta `backend`. Migrações e seed de teste são aplicados pelos scripts `pretest` / `posttest` em `backend/package.json`.
- **Frontend:** não há suíte centralizada neste repositório; esta pasta reserva espaço para **testes transversais** (por exemplo, contratos de API ou smoke scripts) se você quiser adicionar depois.

Para rodar apenas o backend em modo teste, veja `backend/package.json` (`NODE_ENV=test`).
