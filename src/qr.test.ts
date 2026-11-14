import { describe, expect, it } from 'vitest';
import { validatePayload, renderSVG } from './qr';

describe('local QR generation', () => {
  it('rejects empty content', () => expect(() => validatePayload('  ')).toThrow());
  it('accepts URLs and text', () => expect(validatePayload(' https://example.com ')).toBe('https://example.com'));
  it('rejects oversized UTF-8 payloads', () => expect(() => validatePayload('å'.repeat(1100))).toThrow());
  it('generates a vector QR locally', async () => expect(await renderSVG('https://example.com')).toContain('<svg'));
});
