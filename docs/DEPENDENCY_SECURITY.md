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

The user's local installation reported **two critical and one moderate** vulnerability on 2026-11-17. This count is a snapshot, not a verified list of affected packages; the workflow report is needed to identify them.
