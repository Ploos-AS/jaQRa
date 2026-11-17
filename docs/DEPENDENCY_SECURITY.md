# Dependency security review

jaQRa uses a committed npm lockfile. The weekly and manually triggered **Dependency security audit** GitHub Actions workflow runs `npm ci` and `npm audit --json`, publishes a summary and uploads the raw report as an artifact for 14 days.

The audit workflow is **report-only** to allow a baseline of existing advisories; it does not change packages, automatically suppress findings, or claim the project is safe. CI build and tests remain mandatory. A subsequent remediation PR should make the security audit blocking once the known issues have been resolved.

## Triage procedure

1. Run the audit workflow manually in GitHub Actions or run `npm audit` locally.
2. Record each affected package, severity, advisory, dependency chain, fixed version and whether it is runtime or dev-only.
3. Prefer minimal compatible updates to direct dependencies, then regenerate `package-lock.json` using `npm install`.
4. Do **not** use `npm audit fix --force` without examining major-version changes.
5. Run `npm ci`, `npm test`, `npm run build`, and rerun `npm audit`.
6. Confirm that any remaining findings are documented and justified before beta.

## 2026-11-17 remediation snapshot

The initial GitHub Actions audit reported 7 affected packages: 2 critical, 4 high, and 1 moderate. After upgrading direct development dependencies to Vite 8.3.8 and Vitest 5.1.0, local tests (131 Vitest tests plus 3 precache tests) and production build passed. Local `npm audit` then reported **5 high, 0 critical, 0 moderate** findings. These remaining alerts trace through development-tool dependencies to `picomatch@4.0.7`, specifically advisory `GHSA-fc5q-39xc-vjpf` (glob-pattern ReDoS). At the time of the check, `picomatch@4.0.7` was the latest version reported by npm.

**Risk and limitation:** These dependencies are declared as development dependencies, not directly shipped browser runtime packages. They still execute in local and CI build environments; untrusted glob patterns may be a risk. This is **not** a declaration that the vulnerability is harmless or accepted for public beta. Avoid running the build pipeline on untrusted inputs, monitor the advisory, and reassess before beta release. Do not downgrade or force-install incompatible packages solely to silence npm audit. Re-run the audit in CI after merging and record any changes.
