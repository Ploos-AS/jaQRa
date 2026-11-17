# jaQRa — public beta readiness review

Status: **NOT APPROVED FOR PUBLIC BETA**. This is a source-review checklist, not a completed audit or release authorization.

## Implemented pre-beta scope

Static QR types: URL, text, Wi-Fi, vCard, email, SMS, phone and geographic coordinates. Design presets, custom colors, module styles, logo overlay, SVG/PNG exports, QR verification, print frames, CSV batch export, A4/A5/US Letter/US Legal label sheets, image/camera scanner, and opt-in browser-local QR library (collections, search, favorites, JSON backup/restore).

No managed/dynamic codes, account system, hosted library, billing, API or analytics are part of this beta.

## Blocking checks before a public beta

| Priority | Area | Required acceptance evidence |
| --- | --- | --- |
| P0 | Offline PWA | Install, go offline, hard reload, generate and export a QR. Confirm built JS/CSS assets are available offline, not just the HTML shell. Inspect service worker cache behavior after upgrades. |
| P0 | Privacy | Verify QR payloads, uploaded images, camera frames and local library data are never sent to a server. Inspect network traffic during all workflows, including service worker requests. |
| P0 | QR correctness | Test every payload type and export format using at least two independent scanners, including Wi-Fi and vCard interoperability. |
| P0 | Stale exports | Run docs/QR_STATE_QA.md; confirm invalid and rapidly changing inputs cannot export old data. |
| P0 | Security | Review untrusted CSV/JSON/image handling, generated SVG and dynamic DOM insertion; run dependency and static security checks. |
| P0 | Backup safety | Test import/merge/replace and round-trip with both legacy and collection-bearing backups. Verify malformed/oversized backups fail safely. |
| P0 | Accessibility | Perform keyboard, screen-reader, 200% zoom and contrast checks. See docs/ACCESSIBILITY_QA.md. Do not claim WCAG conformance without evidence. |
| P0 | Release | Public deployment requires an explicitly approved and tested permanent-host deployment and safe Ploos-Deploy adoption path. Ploos-Deploy development is currently paused; do not install, deploy manually, or change DNS as part of this review. |
| P1 | Browser compatibility | Test current Firefox, Chromium/Chrome and Safari on desktop and mobile, including camera permissions. |
| P1 | Performance | Test worst-case 100-row CSV, low-memory mobile devices, long Unicode payloads and image processing. |
| P1 | Print | Confirm A4/A5/Letter/Legal dimensions, margins, page breaks and print preview on at least two browsers. |
| P1 | User communication | Publish plain-language privacy/storage limitations, offline support scope, backup warnings and static-vs-dynamic distinction. |
| P1 | Operations | Prepare incident contact, rollback strategy, versioned release notes and a repeatable smoke test before launch. |

## Observations and evidence status (updated 2026-11-17)

1. The production build now generates a fingerprinted asset precache with automated checks; this resolves the earlier **source-review observation** about missing JS/CSS precache. Real browser install/update/offline reload tests remain unverified.
2. GitHub Actions for the first GHCR publication reported 131/131 Vitest tests passing and successful image publication. These are **automated build results**, not evidence of browser compatibility, privacy verification, independent QR scanner interoperability, or accessibility conformance.
3. Browser-based end-to-end and assistive-technology acceptance evidence has not been recorded in this checklist.
4. Existing local storage and backups may contain sensitive QR data. Public documentation must not imply server synchronization or encrypted local storage.
5. Forseti's permanent app layout is verified as `/srv/ploos-apps/<app>/{data,releases}` and `/etc/ploos-apps/<app>/compose.yaml`; a GHCR image exists. Ploos-Deploy's guarded adoption of existing Compose projects remains unimplemented and development is paused. See `PERMANENT_HOST_HANDOFF.md`.

## Manual browser acceptance

Use [the browser beta test runbook](BROWSER_BETA_TEST.md) to record Firefox, Chromium, Android Chrome and iOS Safari results. The runbook is a protocol only; it does not assert any browser has passed.

## Beta go/no-go decision

A public beta may be proposed only after all P0 items have documented pass results, any security/privacy blockers are resolved, and a Ploos-Deploy-compatible deployment is reviewed and explicitly approved. A green CI run alone is **not** sufficient. Record the reviewer, date, tested commit and evidence links in a separate release checklist. A blank reusable evidence template is available in [BETA_EVIDENCE_TEMPLATE.md](BETA_EVIDENCE_TEMPLATE.md).
