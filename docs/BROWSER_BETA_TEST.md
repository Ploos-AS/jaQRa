# jaQRa — browser beta acceptance runbook

**Status: untested.** This is a manual QA protocol, not evidence that browsers have passed. No public deployment or DNS changes are authorized.

## Test setup

Use a clean browser profile. From the repository root:

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

Open the local URL printed by Vite (normally `http://127.0.0.1:4173/`). **Do not use `npm run dev` for offline testing:** the production build and service worker must be exercised. Browser DevTools should be open with Network and Application/Storage panels available. Do not enable “Disable cache” when assessing offline behavior; use the browser's explicit offline network emulation instead.

Record the Git commit SHA, OS, browser version, device, date, tester, and results for each case. Never include real Wi-Fi passwords, phone numbers or personal contacts in screenshots or issue reports.

## Browser matrix

| Browser | Platform | Online | Offline reload | Offline QR export | PWA install/update | Camera | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Firefox | Linux desktop | ☐ | ☐ | ☐ | N/A if unsupported | ☐ | |
| Chromium | Linux desktop | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Chrome | Android | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Safari | iOS | ☐ | ☐ | ☐ | ☐ | ☐ | |

N/A is permitted only with an explanation of platform limitations. Mark cases PASS, FAIL, BLOCKED or N/A, not just checked/unchecked.

## Core scenarios (run in Firefox and Chromium)

1. **First load:** clear site data, load online, verify the QR creator renders without console errors, and inspect service worker registration and Cache Storage. Confirm the `jaqra-precache-...` cache includes `index.html`, hashed JS/CSS, manifest and icon.
2. **Static QR:** generate URL and Unicode text QR codes. Download SVG and PNG. Scan both files with an independent scanner; verify exact payload, including Unicode.
3. **Payload interoperability:** generate Wi-Fi, vCard, email, SMS, phone and geo QR codes with synthetic data. Validate with at least two independent scanners; document any compatibility issues.
4. **Invalid content:** enter empty/invalid input and rapidly change design, QR type and payload. Confirm old SVG/PNG/Print/Save actions remain disabled until the latest QR is validated. See `docs/QR_STATE_QA.md`.
5. **Library:** save a QR locally, assign a collection, search, favorite, export a JSON backup, clear the library, import and restore. Verify that browser-local data is not automatically synced.
6. **Batch and print:** generate a small CSV batch and a 100-row batch. Inspect ZIP contents, print preview and A4/US Letter label alignment.
7. **Image scanner:** scan a known QR from an uploaded image. Confirm decoded text is shown, external links require an explicit click and no navigation occurs automatically.
8. **Camera scanner:** allow and deny camera permission, switch cameras if available, start/stop scanning and verify the camera stops after a successful scan or when the tab becomes hidden.
9. **Offline reload:** after the app is fully loaded online and the service worker is activated, emulate offline mode. Reload, generate and export a new text QR, open the library and scan a locally uploaded QR image. Confirm no dependency on the network.
10. **Privacy:** inspect Network requests during creation, image upload, camera use, library backup and offline usage. Verify QR payloads and local data are not transmitted. Note that browser extensions and developer tooling may generate unrelated requests.
11. **Accessibility:** keyboard-only navigation, visible focus, labels, zoom at 200%, reduced motion and screen reader smoke test. See `docs/ACCESSIBILITY_QA.md`.

## Offline update / rollback simulation

A service worker cannot be meaningfully update-tested by repeatedly serving identical files. Build **two different commits** in separate temporary directories and serve them sequentially on the same localhost origin and port, with a fresh build for each. Record both precache versions.

1. Load version A online, wait for worker activation, confirm A works offline.
2. Reconnect; serve version B at the same origin, reload and wait for the updated worker to activate. Verify B's asset cache and that obsolete `jaqra-` caches are removed.
3. Go offline and reload. Verify version B works without mixed assets.
4. To simulate a failed update, block a required asset request while version A remains installed. Confirm version A continues to work. Do not delete the browser's cache between steps.

## Recording findings

For each failure capture: test case number, expected vs actual behavior, browser/OS, commit SHA, minimal reproduction steps, relevant console errors and sanitized screenshots. Classify P0 if privacy, security, stale export, QR correctness or offline reload is broken; otherwise P1/P2 based on user impact. Do not record real credentials or decoded private data.

## Go / no-go

A green CI run and completed checklist are not equivalent. All P0 cases must be **PASS** with documented evidence before proposing public beta. Deployment still requires a separately approved Ploos-Deploy workflow. Track unresolved issues in GitHub rather than marking them as passed.
