# jaQRa beta acceptance evidence — blank template

**Status: NOT TESTED / NOT APPROVED.** Copy this file to a dated, sanitized release record for each candidate. Do not mark PASS based solely on green CI.

## Candidate identity

| Field | Value |
| --- | --- |
| Tested commit SHA | TODO |
| Candidate image digest (if applicable) | TODO / N/A for local preview |
| Test date and reviewer | TODO |
| Test environment / local preview origin | TODO |
| Browser + version / OS / device | TODO |
| Network inspector used | TODO |
| Evidence location (sanitized screenshots/logs/issues) | TODO |

## P0 acceptance record

For each row set **PASS**, **FAIL**, **BLOCKED**, or **NOT TESTED**. PASS requires a reproducible test result and evidence reference. Use only synthetic payloads; do not commit passwords, TOTP secrets, real contacts, camera frames or sensitive backup contents.

| Gate | Status | Evidence / issue | Notes |
| --- | --- | --- | --- |
| Offline install + hard reload + QR export | NOT TESTED | | Check precached hashed JS/CSS and worker updates |
| Privacy / network requests | NOT TESTED | | Include upload, camera, library, backup, offline |
| Independent scanner interoperability | NOT TESTED | | At least two scanners; formats and exports |
| Stale export regression | NOT TESTED | | Follow QR_STATE_QA.md |
| CSV/JSON/image/SVG input security | NOT TESTED | | Include malformed and oversized inputs |
| Library backup merge/replace/round-trip | NOT TESTED | | Legacy and collection-aware formats |
| Keyboard, screen reader, zoom, contrast | NOT TESTED | | Follow ACCESSIBILITY_QA.md |
| Deployment/adoption authorization | BLOCKED | | Ploos-Deploy development paused; no production install |

## P1 acceptance record

| Gate | Status | Evidence / issue |
| --- | --- | --- |
| Firefox / Chromium / Android Chrome / iOS Safari | NOT TESTED | |
| 100-row batch, low-memory device, Unicode | NOT TESTED | |
| A4/A5/Letter/Legal print in two browsers | NOT TESTED | |
| Privacy/offline/backup/static-vs-dynamic user messaging | NOT TESTED | |
| Incident contact, release notes, rollback rehearsal | NOT TESTED | |

## Automated evidence (record per candidate)

| Check | Status | Workflow run / commit |
| --- | --- | --- |
| Unit tests | NOT TESTED | |
| Production build + precache smoke | NOT TESTED | |
| Container build | NOT TESTED | |
| Dependency audit review | NOT TESTED | |

Automated success does not override failed manual P0 gates. Review current dependency advisories and document their applicability; do not assert zero vulnerabilities without a current scan.

## Decision

- Decision: **NO-GO** (default)
- Reviewer / date: TODO
- Blocking issues: TODO
- Residual risks and explicit acceptance: TODO
- Release authorization reference: TODO

A public beta requires documented P0 PASS results and separate deployment authorization. Do not publish real credentials or user data in evidence.
