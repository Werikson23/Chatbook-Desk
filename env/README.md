# Variáveis de ambiente

Arquivos nesta pasta são referenciados pelos `docker compose` em `../docker/`.

| Arquivo | Uso |
|--------|-----|
| `.env-backend-local` | Backend no stack Docker local (`docker/docker-compose-local.yaml`). |
| `.env-frontend-local` | Frontend no stack Docker local. |
| `.env-backend-acme` | Backend com proxy HTTPS + Let's Encrypt (`docker/docker-compose-acme.yaml`). |
| `.env-frontend-acme` | Frontend no cenário ACME. |
| `.env-backend-cloudflare` | Backend atrás de Cloudflare (`docker/docker-compose-cloudflare.yaml`). |
| `.env-frontend-cloudflare` | Frontend no cenário Cloudflare. |
| `.env-cloudflared` | Túnel `cloudflared` (serviço `cloudflared` no compose Cloudflare). |

**Desenvolvimento com Node no host (sem Docker no app):** use `backend/.env.example` → copiar para `backend/.env.development` (ver `docs/Local Development.*.md` e `env/backend/README.md`).
