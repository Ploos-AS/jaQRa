# jaQRa static preview deployment

This is a **static-only preview**. No backend, accounts, redirects, billing or analytics are deployed.

## Build and run

On a host with Docker and Compose installed:

```sh
docker compose -f compose.preview.yml up -d --build
docker compose -f compose.preview.yml ps
curl -fsSI http://127.0.0.1:18080/
```

The container binds only to **127.0.0.1:18080**. Do not expose it directly to the internet.

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
