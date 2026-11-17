# Camera Scanner Studio

Camera scanning runs locally in the browser using `getUserMedia`, Canvas and the existing `jsqr` decoder. It does not upload frames or transmit decoded content. Camera permission is requested only when the user presses **Start camera**. Browsers require a secure context (HTTPS or localhost).

## Controls and privacy

- Start camera defaults to the rear-facing camera when available.
- Camera selection is populated from browser-reported video devices; labels may be unavailable until permission is granted.
- Stop camera stops all media tracks and removes the preview.
- Scanning stops automatically after the first decoded QR, when the page is hidden, or on navigation.
- Links are not opened automatically; the user must explicitly choose to open HTTP(S) content.
- Camera access can be revoked through browser site permissions.

## Manual checks

1. Test HTTPS on Android Chrome, iOS Safari and a desktop browser with webcam.
2. Deny permission and verify a useful error and that the user can retry.
3. Start, stop and restart; confirm the camera indicator switches off after stopping.
4. Switch between cameras, if available, and verify the selected device.
5. Scan a QR containing ordinary text, an HTTPS URL and a potentially unsafe URI scheme.
6. Hide the page or navigate away while scanning; verify tracks stop.
7. Verify image upload scanning still works and no QR data leaves the browser.

Camera support is subject to browser and device capabilities. No backend or Ploos-Deploy integration is required.
