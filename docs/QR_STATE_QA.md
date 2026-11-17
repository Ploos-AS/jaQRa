# QR generation state regression checklist

QR rendering and scan verification are asynchronous. A previously validated QR must **never** remain downloadable or saveable while a new edit is awaiting validation or has failed.

## Manual regression cases

1. Generate a valid URL QR. Confirm SVG, PNG, Print and Save are enabled.
2. Edit the URL to an invalid value. All four actions should disable immediately, and remain disabled after the error.
3. Restore a valid URL. Actions should stay disabled until verification succeeds.
4. Change QR type from a valid URL to Wi-Fi. No stale download/save actions should remain enabled while new fields are created.
5. Rapidly change text, color, quiet zone and module style. Only the most recent request should enable actions; inspect the downloaded QR for the final input.
6. Add/remove a logo, then test an invalid logo or unreadable QR. Confirm stale export and save actions are unavailable.
7. Load a saved QR from the library and immediately change its fields. Do not allow exporting or saving the previous QR under the new input.
8. Confirm the library's **Save current QR** button is disabled after an error even when a previously generated QR was valid.

## Automated follow-up

Consider extracting asynchronous generation into a testable controller for race-condition unit tests. This patch intentionally keeps the change small and does not claim complete coverage of all asynchronous input paths.
