# jaQRa architecture

## Separation of concerns

```text
Browser / installable PWA
  ├── Static QR payload formatters
  ├── Local QR encoder + renderer
  ├── Scanner / validator (planned)
  ├── Local templates (planned)
  └── SaaS API client (optional)
           │
           ▼
       Go SaaS API
          ├── Accounts and authorization
          ├── Dynamic QR management
          ├── Redirect service
          ├── Teams and billing
          └── PostgreSQL
```

Static QR content must not be sent to the API. The static QR workflow must function without logging in, and after PWA assets are cached, without network access.

## Payload categories

- Text: plain text.
- Links: URL, including URI schemes supported by scanners.
- Communications: mailto, tel, sms.
- Contacts: vCard and MeCard.
- Connectivity: Wi-Fi configuration.
- Events: iCalendar VEVENT payload.
- Geographic: geo URI.
- Security-sensitive: TOTP provisioning (later; only in memory, local processing, explicit warnings).

QR encoders and payload formatters should be independent modules. Test scanner compatibility and escaping rules. QR rendering must account for error correction and mandatory quiet zone. Logos may reduce readability and must be validated rather than automatically assumed safe.

## Dynamic QR separation

A dynamic QR is an ordinary QR containing a managed redirect URL. This requires a reachable service and is not offline or permanent by default. Do not claim that all QR codes expire. The managed redirect service should avoid leaking destinations in analytics and offer privacy-aware statistics as an opt-in feature.

## Cross-product integration

jaQRa is its own brand. qix.no may integrate the shared encoder or call published APIs, but jaQRa static QR generation must not depend on qix.no uptime.

## Security baseline

No server submission of Wi-Fi passwords, contact information, or authentication seeds from the static generator. Avoid third-party scripts on sensitive views. Apply CSP, escape/validate displayed payloads, and prevent open-redirect abuse for dynamic codes. Include abuse reporting and rate limits before launching managed redirects.

## Delivery

Frontend can be served as static assets over HTTPS. Backend Go services run in containers behind a reverse proxy, with PostgreSQL reachable only internally. Define configuration, backups, monitoring and migrations when the SaaS component is implemented.
