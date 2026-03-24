# Backup e restore (PostgreSQL)

Pressupõe Postgres no Docker de desenvolvimento (`docker/docker-compose.dev.yml`) ou equivalente.

## Backup lógico (`pg_dump`)

Na máquina host (com `docker` e container nomeado ou descoberto pelo serviço):

```bash
docker compose -f docker/docker-compose.dev.yml exec -T postgres \
  pg_dump -U ticketz -d ticketz --no-owner -Fc > backup_ticketz_$(date +%Y%m%d).dump
```

Formato custom (`-Fc`) permite restore seletivo com `pg_restore`.

## Restore

```bash
cat backup_ticketz_YYYYMMDD.dump | docker compose -f docker/docker-compose.dev.yml exec -T postgres \
  pg_restore -U ticketz -d ticketz --clean --if-exists
```

Em produção, use snapshots do volume, replicação ou backup gerenciado pelo provedor; guarde dumps fora do servidor e teste restore periodicamente.

## Rollback de migrações (deploy)

O Sequelize permite desfazer a última migração:

```bash
cd backend && npx sequelize db:migrate:undo
```

Para estratégia de deploy: aplicar migrações em janela controlada, manter backup antes de `db:migrate`, e ter script de `undo` testado para a release anterior.
