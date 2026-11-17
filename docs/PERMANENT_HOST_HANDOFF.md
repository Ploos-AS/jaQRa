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
  releases/<immutable-release-id>/
  current -> releases/<immutable-release-id>
  shared/              # persistent app-specific configuration; no secrets in Git
  deploy/              # Compose configuration and deployment metadata
```

The **existing host root** is `/srv/ploos-apps/` and the `jaqra` directory already exists on Forseti, as confirmed by an operator directory listing on 2026-11-17. The internal `releases/current/shared/deploy` layout shown above is **only a proposal**, not a verified description of the existing `jaqra` directory or the implemented Ploos-Deploy schema. Confirm root paths, ownership, symlink safety, Compose project identity, image digest, state format, locks and rollback behavior with Ploos-Deploy before using it. Ploos-Deploy's own architecture currently requires refusal of unmanaged projects and symlink/path traversal protection; an adoption feature must preserve those safeguards.

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
- A stable, unique Compose project name, a health check, restart policy, resource controls, least-privilege container settings and loopback-only host port binding (or a private network reviewed for host-Caddy access).
- Host Caddy terminates HTTPS and routes to the stable upstream; the container's Caddy serves static assets only.
- No browser QR payloads, Wi-Fi passwords, TOTP secrets or other local-only QR data should be sent to the server.
- Release identity should be immutable and tied to a tested image digest; keep prior known-good image available for rollback.

## Gate before first permanent installation

- [ ] Inspect the existing `/srv/ploos-apps/jaqra/` directory, Compose projects and host Caddy configuration **read-only**; directory existence alone does not establish a running deployment.\n- [ ] Confirm Forseti is the approved **permanent** app host for jaQRa and verify its operational readiness.
- [ ] Agree the actual on-disk layout and adoption state contract with Ploos-Deploy maintainers.
- [ ] Implement and test the guarded Ploos-Deploy adoption workflow on a **disposable** Compose app.
- [ ] Verify install, read-only discovery, adoption, updates, failure injection, explicit rollback and routing continuity.
- [ ] Review TLS, backup, logging, monitoring, image supply chain, least privilege and remaining dependency advisories.
- [ ] Obtain explicit approval for permanent host installation and later for public DNS/production exposure.

Until these gates are met, **do not install jaQRa on a permanent host** or imply that an arbitrary manual Compose installation is already compatible with Ploos-Deploy. Local preview remains available for development.
