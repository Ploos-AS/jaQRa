# jaQRa

**Every QR. One Place.**

jaQRa is a privacy-first, international QR code platform by **Ploos AS**. The goal is to offer a free, offline-capable Progressive Web App (PWA) for static QR codes, with optional SaaS capabilities for managed and dynamic codes.

Website (planned): **jaqra.com**

## Product principles

- **Free static codes:** No account, watermark, tracking, expiration, or artificial generation limits.
- **Local-first privacy:** Static payloads, including Wi-Fi credentials and contact details, are processed in the browser. Never transmit sensitive QR payloads to the server.
- **Accessible by default:** Keyboard navigation, clear labels, visible focus, and usable mobile layouts.
- **Interoperable:** Export PNG and SVG first, with PDF and batch generation to follow.
- **Vendor-neutral core:** Reusable QR encoding components, with a permissively licensed core where dependencies allow.
- **Honest dynamic-code model:** Dynamic codes require jaQRa-managed URLs and server availability; users should always understand this distinction.

## Planned static formats

URL, text, Wi-Fi, vCard, MeCard, email, SMS, telephone, geographic coordinates, calendar events, and other standardized payloads where interoperability can be validated.

**Security note:** TOTP provisioning contains account secrets. If supported later, it must be entirely local, have explicit warnings, and never be logged or synced by default.

## Planned premium capabilities

Dynamic redirects, managed destinations, custom domains, team libraries, opt-in privacy-conscious analytics, bulk generation, and API access.

## Deployment policy

jaQRa will use [Ploos-Deploy](https://github.com/Ploos-AS/Ploos-Deploy) for managed deployments when that project supports non-test applications. Ploos-Deploy is still experimental; no live jaQRa deployment is authorized or configured. The existing Docker Compose preview is for isolated development testing only. See [preview deployment notes](docs/PREVIEW_DEPLOYMENT.md).

## Technology direction

- Frontend: TypeScript PWA, capable of working offline.
- Backend: Go, for features requiring a server.
- Storage: PostgreSQL when the managed SaaS features are introduced.
- Deployment: Container-based on European infrastructure.
- Integrations: Shared components with qix.no, while keeping jaQRa a distinct product.

## Roadmap

1. Implement offline-first static QR generation and reliable decoding tests.
2. Add accessible design controls and PNG/SVG exports.
3. Add PWA installation, local templates, and scanner/validator.
4. Add CSV batch generation and printable exports.
5. Introduce accounts, dynamic QR redirects, billing, teams, and API progressively.

See [architecture](docs/ARCHITECTURE.md) and [contributing](CONTRIBUTING.md).

## Status

Early project foundation. Features described above are **plans**, not a claim of shipped functionality.

## Ownership and license

Copyright Ploos AS. No project-wide software license has been granted yet. The QR core is **intended** to be MIT licensed once introduced, with dependency and licensing review.
