# Offline PWA acceptance tests

Build: `npm ci && npm run build && npm run preview`. Use a clean browser profile and a secure origin (localhost is accepted by browsers for service workers).

1. Visit the app online and wait until the service worker is activated. Confirm Cache Storage contains a `jaqra-precache-...` cache with `index.html`, manifest, icon and the hashed `assets/*.js` and `assets/*.css` files.
2. Enable offline mode in DevTools. Reload the page (including a hard reload where supported). Confirm the UI loads and a text QR can be generated, validated and exported without network access.
3. Repeat for Wi-Fi and vCard payloads, library save/restore and scanner from an uploaded image. Camera behavior is device/browser-dependent.
4. Reconnect, deploy a new build to a *test-only* environment, refresh and confirm the new service worker activates and removes old `jaqra-` caches. Repeat offline reload after the update.
5. Confirm external and cross-origin requests are never cached by the service worker, and POST requests are not intercepted.
6. Simulate a failed install by blocking a required static asset: a partially cached worker must not replace the previously working worker.

## Implementation

The post-build script `scripts/precache.mjs` scans Vite's `dist` output and generates `dist/sw.js` with a versioned manifest of the exact built assets. The service worker precaches those assets atomically during installation, serves static assets cache-first, and falls back to cached HTML for offline navigations.

**Limitations:** This does not make camera hardware, external links, network services or future dynamic SaaS features available offline. No public deployment is authorized by this change. Browser acceptance testing remains required before declaring the offline PWA release-ready.
