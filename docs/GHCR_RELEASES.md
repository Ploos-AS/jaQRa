# jaQRa GHCR image releases

Workflow: `.github/workflows/ghcr-release.yml`.

## Behavior

- Pull requests touching the image, app or workflow run tests, production build and Docker build **without publishing**.
- Pushes to `main` and manual dispatches verify and publish `ghcr.io/ploos-as/jaqra:sha-<full-git-sha>`.
- Version tags matching `vX.Y.Z` (optional prerelease suffix) additionally publish the version tag.
- The build action publishes an immutable **digest** in the GitHub Actions job summary. For Forseti use the digest reference, not a mutable tag.
- The workflow does **not** deploy to Forseti, change Caddy, change DNS, or invoke Ploos-Deploy.
- GHCR package visibility and permissions must be checked separately; the workflow needs the repository's GitHub Actions package write permission.

## Security and operational boundaries

The workflow checks `npm test`, `npm run build` and `docker build --pull` before publishing. A passing build is not proof of zero vulnerabilities; dependency audit warnings remain separately tracked. `--pull` refreshes base image layers but does not pin them; for fully reproducible releases, pin and periodically review the base-image digests in the Dockerfile. GitHub Actions third-party actions are version-tagged, not SHA-pinned; hardening may follow.

Before deploying an image, inspect the published digest, perform an isolated container smoke test, confirm the planned host port, and obtain explicit authorization. The permanent-host Ploos-Deploy adoption blocker described in [PERMANENT_HOST_HANDOFF.md](PERMANENT_HOST_HANDOFF.md) remains unresolved.
