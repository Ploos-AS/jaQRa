> **Deployment policy:** jaQRa's intended deployment orchestrator is [Ploos-Deploy](https://github.com/Ploos-AS/Ploos-Deploy). Ploos-Deploy is experimental and currently limited to a disposable Balder test application. The manual Compose procedure below is retained for isolated local testing only; it is **not** the approved production or public beta deployment method. Do not deploy jaQRa to Forseti or change DNS until Ploos-Deploy supports general applications and has been validated.

# jaQRa static preview deployment

This is a **static-only preview**. No backend, accounts, redirects, billing or analytics are deployed.

## Local development / isolated container test only

The following commands are for a developer-controlled test host, **not** a jaQRa production rollout.

## Build and run

On a host with Docker and Compose installed:

```sh
docker compose -f compose.preview.yml up -d --build
docker compose -f compose.preview.yml ps
curl -fsSI http://127.0.0.1:18080/
```

The container binds only to **127.0.0.1:18080**. Do not expose it directly to the internet.

## Optional HTTPS for an isolated preview

Do not publish a jaQRa hostname or change DNS as part of this documentation-only change.

## HTTPS with host Caddy

In the host's existing Caddyfile, add a **preview hostname that you control**:

```caddy
preview.example.com {
 reverse_proxy 127.0.0.1:18080
}
```

Replace `preview.example.com` with the actual DNS name. Configure DNS to point to the server, then reload host Caddy. HTTPS is required for reliable PWA/service-worker testing.

## Smoke test

1. Open the HTTPS preview and create a URL QR code.
2. Verify SVG and PNG exports and scan the result with another device.
3. Upload a sample `name,payload` CSV, test ZIP generation and batch labels.
4. Test A4 and US Letter print previews, margins and multiple pages.
5. Install the PWA, then disable network access and test previously visited features.
6. Check browser developer tools: QR payloads should not be sent to any server.

## Updates and rollback

Rebuild from a known Git commit. Keep the previous commit SHA available for rollback; use `git checkout <previous-sha>` and rebuild if necessary. Note that a service worker can retain cached assets: check both normal and offline behavior after deploying a new build.

## Limitations

This preview uses a generic Caddy static file server. Browser print settings and physical printer tolerances must be checked separately. No production readiness or live deployment is implied.

## Future Ploos-Deploy integration (not implemented)

jaQRa should consume the common Ploos-Deploy lifecycle once it supports general-purpose applications: immutable GHCR image pinned by digest, declarative manifest, preflight/plan, deployment health checks, state tracking, and explicit rollback. Do not create an unverified manifest schema or run Ploos-Deploy against jaQRa while the CLI only permits its disposable test target.

Before first public beta deployment:

1. Confirm Ploos-Deploy has documented support for non-test applications and a reviewed manifest schema.
2. Publish a jaQRa image to GHCR with a reproducible build and immutable digest.
3. Define the jaQRa deployment manifest using the **actual supported schema**, with a loopback-only internal port and health checks.
4. Test install, update, failed health check and rollback with a disposable environment.
5. Select the destination host and preview domain explicitly; confirm DNS, TLS and reverse proxy configuration.
6. Run the smoke tests above and verify that static QR payloads never leave the browser.

The long-term Ploos-Deploy target is Forseti, but no host assignment is made for jaQRa here.
