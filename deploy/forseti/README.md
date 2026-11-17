# jaQRa on Forseti — configuration preparation only

**Do not deploy or modify Forseti based solely on this template.** This repository change creates no running service, Caddy route, DNS entry, credentials, or server files.

## Verified host conventions (2026-11-17)

- Existing app directories: `/srv/ploos-apps/<app>/data/` and `releases/`, root-owned. jaQRa directories exist but were empty.
- Existing Compose configurations: `/etc/ploos-apps/<app>/compose.yaml` under a root-only directory. jaQRa config directory did not exist at inspection.
- Host Caddy proxies Qix on 127.0.0.1:18080 and Forenio on 127.0.0.1:18081. No jaQRa route yet.
- No listener was observed on port 18082 at inspection; verify again immediately before use.
- GHCR Docker authentication config exists on host; this does not prove that a jaQRa image is published or credentials work.

## Planned configuration

- Use this `compose.yaml` as a **reviewed template**, not as an automatically deployed artifact.
- Future approved host path: `/etc/ploos-apps/jaqra/compose.yaml`.
- Project name: `jaqra`; single static PWA service, no database or Redis.
- Required `JAQRA_IMAGE`: immutable `ghcr.io/ploos-as/jaqra@sha256:<64-hex>`. No `latest` tags.
- Optional `JAQRA_HOST_PORT` defaults to 18082; bind only to loopback.
- Container serves static files with Caddy on port 8080; its current health check uses `/`, **not** `/healthz`.
- Existing `data/` and `releases/` remain intact; no additional directories or symlinks are assumed.

## Read-only checks before any deployment

```sh
sudo ls -la /srv/ploos-apps/jaqra /etc/ploos-apps
sudo ss -ltnp '( sport = :18082 )'
sudo docker compose ls -a
sudo docker ps -a
sudo caddy validate --config /etc/caddy/Caddyfile
```

Before use, inspect image availability and digest, confirm the intended Caddy domain `jaqra.com`, verify DNS and TLS, and obtain explicit deployment approval. Review the static app's read-only filesystem behavior and health checks in a disposable test environment. Do not print registry credentials.

## Ploos-Deploy compatibility blocker

Ploos-Deploy currently refuses to adopt unmanaged Compose projects. An installation using this template **cannot yet be guaranteed to transfer into Ploos-Deploy without disruption**. Implement and rehearse explicit, safe adoption, release state import and rollback on a disposable app before installing jaQRa permanently. See [handoff contract](../../docs/PERMANENT_HOST_HANDOFF.md).

## Rollback and continuity

Image digests and release metadata must remain available to Ploos-Deploy. A Compose restart or symlink switch by itself does **not** guarantee zero-downtime updates. Do not advertise that property until tested.
