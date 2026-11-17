# jaQRa permanent-host deployment and Ploos-Deploy handoff

**Status: compatibility requirements only. No installation is authorized by this document.**

## Ploos AS operating principle

Install applications on their intended permanent application host from day one. The long-term requirement is that Ploos-Deploy can **adopt the existing deployment in place**, without reinstalling, moving servers, changing public routing, or planned downtime. This is a **target capability**, not something Ploos-Deploy currently implements.

## Current implementation reality (checked 2026-11-17)

- Ploos-Deploy currently accepts a minimal JSON manifest (`name`, SHA256-pinned `image`, `port`, `health_path`) and restricts its deployment command to a disposable test application. Its target architecture explicitly says **never replace or adopt unmanaged Compose projects**.
- Ploos-Deploy's planned permanent app host is `forseti.ousdal.net` (aliases `apps.ousdal.net` and `apps.ploos.no`). This is a design target, **not proof that Forseti is provisioned or selected for jaQRa**.
- jaQRa currently has a local-only `compose.preview.yml` and a static Docker/Caddy image. It is **not** a production installation.

**Blocking dependency:** Ploos-Deploy must first implement and test an explicit, safe **adopt/import existing deployment** operation. A manually created Compose project is **not automatically adoptable**. Do not bypass the current ownership guard.

## Existing Forseti application root and proposed app layout

```text
/srv/ploos-apps/jaqra/
  data/                 # existing persistent-data directory
  releases/             # existing releases directory
  # release pointer and deployment metadata: location not yet agreed
```

The **existing host root** is `/srv/ploos-apps/`. Operator listings on 2026-11-17 confirm that `jaqra`, `kaqen`, and `forenio` each have root-owned `data/` and `releases/` directories, while `/srv/ploos-apps/shared/` is empty. No `current` pointer or app-specific `deploy/` directory was shown. Existing running Compose projects on Forseti use `/etc/ploos-apps/<app>/compose.yaml` (confirmed for Forenio and Qix), not an app-local `deploy/` directory. The intended jaQRa Compose path should therefore be `/etc/ploos-apps/jaqra/compose.yaml`, The operator listing confirms `/etc/ploos-apps/` is root-only (`0700`) and currently contains `forenio/` and `qix/` but **no `jaqra/` directory**. Keep this configuration root-managed and do not expose its contents. Preserve the existing directories; the location of release pointers, Compose config and deployment metadata remains **undecided**. This is not proof that any of the apps is running. Confirm root paths, ownership, symlink safety, Compose project identity, image digest, state format, locks and rollback behavior with Ploos-Deploy before using it. Ploos-Deploy's own architecture currently requires refusal of unmanaged projects and symlink/path traversal protection; an adoption feature must preserve those safeguards.

## Adoption contract to implement and verify in Ploos-Deploy

1. **Read-only discovery:** inspect existing Compose project name, service, image digest, container IDs, health state, port bindings, volumes, network, Caddy upstream and host paths without changing them.
2. **Explicit operator approval:** require a deliberate, authenticated adoption command, never implicit ownership of a pre-existing project.
3. **Identity checks:** verify a pinned image digest, expected service/Compose project, loopback-only binding, health endpoint and ownership/permissions; reject mismatches.
4. **Atomic state registration:** capture current known-good revision and import configuration under the same deployment lock used for future updates. Never delete/recreate the running container during registration.
5. **Routing continuity:** preserve the existing Caddy route, domain and HTTPS certificate; no DNS changes during handoff.
6. **Rollback:** test failed-update recovery and an explicit return to the imported known-good revision before enabling production updates.
7. **Failure safety:** on failed adoption, leave the existing service running and unmanaged; report errors without modifying it.
8. **Zero-downtime validation:** adoption itself must be non-disruptive. Zero-downtime updates are a separate capability that must be tested, not assumed from Docker Compose restart policies or release symlinks.

## jaQRa runtime expectations

- Static PWA served by the existing image's Caddy on container port 8080; HTTP root can serve as a basic health check.
- A stable, unique Compose project name, a health check, restart policy, resource controls, least-privilege container settings and loopback-only host port binding (or a private network reviewed for host-Caddy access). Ports `18080` (Qix) and `18081` (Forenio) are already allocated. Operator `sudo ss -ltnp '( sport = :18082 )'` showed **no listener at inspection time** on 2026-11-17; reserve and recheck `18082` immediately before deployment. The existing Forenio container has a digest-pinned GHCR image, 256 MB RAM and 0.35 CPU limits, restart policy and HTTP `/healthz` check. jaQRa should use the same operational conventions, but its static Caddy image currently serves `/` as its health endpoint (not `/healthz`); verify or implement a dedicated endpoint before adopting Forenio's exact health-check command.
- Host Caddy terminates HTTPS and routes to the stable upstream; the container's Caddy serves static assets only.
- No browser QR payloads, Wi-Fi passwords, TOTP secrets or other local-only QR data should be sent to the server.
- Release identity should be immutable and tied to a tested image digest; keep prior known-good image available for rollback.

## Gate before first permanent installation

- [x] Inspect Compose projects with `sudo docker compose ls -a`: `forenio-beta` uses `/etc/ploos-apps/forenio/compose.yaml` and `qix-sandbox` uses `/etc/ploos-apps/qix/compose.yaml`. Both app containers were healthy; Qix Redis was healthy. No jaQRa Compose project or container was listed.\n- [x] Confirm the host Caddy systemd service is active; **routing configuration has not yet been inspected**.\n- [x] Inspect `/etc/ploos-apps/`: root-only configuration root, no jaQRa configuration directory. Existing Forenio and Qix Compose configs use SHA256-pinned image or required image variable, loopback ports, health checks, resource limits and private networks.\n- [x] Inspect Caddy routing references: existing routes proxy to `127.0.0.1:18080` and `127.0.0.1:18081`; no jaQRa route found in the supplied grep output.\n- [x] Check `18082` with `sudo ss`: no listener at inspection time. Recheck immediately before deployment.\n- [ ] Verify jaQRa image published to GHCR and pin its digest before deployment.\n- [x] Inspect full host Caddyfile: routes for Forseti aliases, `sandbox.qix.no` -> `127.0.0.1:18080`, and `beta.forenio.no`/`forenio.no` -> `127.0.0.1:18081`; **no jaQRa route**.\n- [ ] Confirm DNS for `jaqra.com`, and explicitly approve adding its Caddy route before public exposure.\n- [x] Confirm root-only Docker auth config path exists (`/etc/ploos-apps/docker-auth/config.json`, mode 0600); this does not prove the jaQRa image exists or credentials are valid. Docker commands require `sudo`; do not add `pgo` to the Docker group.\n- [ ] Confirm Forseti is the approved **permanent** app host for jaQRa and verify its operational readiness.
- [ ] Agree the actual on-disk layout and adoption state contract with Ploos-Deploy maintainers.
- [ ] Implement and test the guarded Ploos-Deploy adoption workflow on a **disposable** Compose app.
- [ ] Verify install, read-only discovery, adoption, updates, failure injection, explicit rollback and routing continuity.
- [ ] Review TLS, backup, logging, monitoring, image supply chain, least privilege and remaining dependency advisories.
- [ ] Obtain explicit approval for permanent host installation and later for public DNS/production exposure.

Until these gates are met, **do not install jaQRa on a permanent host** or imply that an arbitrary manual Compose installation is already compatible with Ploos-Deploy. Local preview remains available for development.
