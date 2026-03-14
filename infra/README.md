# TitoNova Production Baseline

This folder contains a first production-ready baseline stack:

- services/api (Node.js API)
- services/ai-orchestrator (FastAPI)
- workers/clone-worker
- workers/export-worker
- Redis queue + dead-letter queues (DLQ)
- Postgres metadata store
- MinIO object storage (S3-compatible)
- Signed S3 upload/download URL API
- Nginx edge proxy (CDN/reverse-proxy placeholder)
- Optional observability profile (OTel Collector + Prometheus + Grafana)
- Optional autoscale worker profile (additional worker replicas)

## Run

1. Copy env:

```bash
cp infra/.env.prod.example infra/.env.prod
```

2. Start core stack:

```bash
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up -d --build
```

3. Start with observability:

```bash
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml --profile observability up -d --build
```

4. Start with autoscale worker profile:

```bash
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml --profile autoscale-workers up -d --build
```

## Health + Metrics

- API health: `http://localhost:${API_PORT:-8080}/health`
- API metrics: `http://localhost:${API_PORT:-8080}/metrics`
- AI health: `http://localhost:${AI_PORT:-8000}/health`
- Edge health: `http://localhost:${EDGE_PORT:-80}/health`
- Prometheus: `http://localhost:${PROMETHEUS_PORT:-9090}`
- Grafana: `http://localhost:${GRAFANA_PORT:-3000}`

## Signed URL Endpoints

- `POST /v1/storage/sign-upload`
  - body: `{ "key": "exports/job-123/site.zip", "content_type": "application/zip" }`
- `POST /v1/storage/sign-download`
  - body: `{ "key": "exports/job-123/site.zip" }`

## Notes

- For production autoscaling, replace compose profile scaling with Kubernetes HPA/KEDA workers.
- Replace local MinIO with managed S3 + CDN.
- Replace static secrets with a proper secret manager.
- Wire service SDKs to OTLP fully for traces/metrics beyond baseline counters.
