# TOTP and GS1 Digital Link QR codes

## TOTP / 2FA

jaQRa can format an **existing** Base32 shared secret as an `otpauth://totp/...` provisioning URI. It does not generate secrets, register an account, or verify a second factor. The QR itself contains the secret and must be treated like a password. Do not share it publicly or include it in screenshots. It is generated in-browser and **cannot be saved to My QR Library or included in JSON backups**. The generator does not send it to a server; exported images still contain the secret and must be handled securely. Some authenticator apps do not support SHA256/SHA512, eight-digit codes or nonstandard periods; SHA1, six digits and 30 seconds are most compatible.

## GS1 Digital Link

jaQRa supports a simplified GS1 Digital Link HTTP URI with GTIN AI (01) and optional lot AI (10) **or** serial AI (21). GTIN length and check digit are validated, and HTTPS is required for the supplied resolver. The resolver must be configured to resolve the generated path; jaQRa does not host one. This does not implement every GS1 application identifier or Digital Link syntax. Validate against a GS1-compliant validator and test your resolver before production labeling.
