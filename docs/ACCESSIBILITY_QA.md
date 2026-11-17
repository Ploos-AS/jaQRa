# Accessibility & mobile QA (PR #21)

This checklist is for manual testing; it is **not** a WCAG conformance claim.

## Keyboard

1. Load the page and press Tab. The **Skip to QR creator** link should appear; Enter moves to the creator.
2. Navigate every input, button and select using Tab/Shift+Tab; focus should remain visible.
3. Use keyboard only to create a QR, save it, search, favorite, move to a collection and delete.
4. Verify confirmation dialogs can be dismissed with Escape and no data changes.

## Screen reader

1. Confirm the main regions and headings identify creator, Batch Studio, library and scanner.
2. Ensure every form field has an announced label, including dynamically generated payload fields.
3. Confirm preview is announced as an image with useful state (empty, verifying, verified or failed).
4. Confirm scan, batch, import and library feedback is announced without taking focus unexpectedly.
5. Check saved rows have individually named Load, Favorite, Collection and Delete controls.

## Mobile

Test 320px, 375px, 768px and desktop widths at 200% browser zoom. Check no horizontal scrolling, overlapping controls, clipped QR preview or tiny touch targets. Check camera start/stop and file picker on mobile.

## Reduced motion and print

Enable reduced-motion preference and verify no essential interaction relies on animation. Verify normal QR print and label printing remain readable and do not print navigation controls.

## Known limitations

Automated tests and this checklist do not establish WCAG 2.2 AA compliance. Manual assistive-technology testing and contrast auditing are still required.
