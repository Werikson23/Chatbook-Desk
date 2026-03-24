# Docker Compose

Execute todos os comandos a partir da **raiz do repositório** (`ticketz/`). Os arquivos em `docker/` definem `name: ticketz`, mantendo volumes como `ticketz_postgres_data` mesmo com `-f docker/...`.

Exemplos:

```bash
docker compose -f docker/docker-compose.dev.yml up -d
docker compose -f docker/docker-compose-local.yaml up -d
```

Arquivos `env_file` apontam para `../env/` (variáveis em `env/` na raiz). Configurações extras (Nginx, PgAdmin) estão em `docker/confs/`.
