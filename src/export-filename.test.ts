import { describe, expect, it } from 'vitest';
import { exportFilename } from './export-filename';

describe('exportFilename', () => {
  it('uses a stable default', () => {
    expect(exportFilename('', 'svg')).toBe('jaqra-qr.svg');
    expect(exportFilename('   ', 'png')).toBe('jaqra-qr.png');
  });
  it('does not duplicate an existing image extension', () => {
    expect(exportFilename('Poster.SVG', 'png')).toBe('Poster.png');
    expect(exportFilename('QR.png', 'svg')).toBe('QR.svg');
  });
  it('removes path separators, control characters and trailing dots', () => {
    expect(exportFilename('../test/qr', 'svg')).toBe('-test-qr.svg');
    expect(exportFilename('hello\\world?', 'png')).toBe('hello-world-.png');
    expect(exportFilename('... ', 'svg')).toBe('jaqra-qr.svg');
  });
  it('caps user-provided filenames', () => {
    expect(exportFilename('x'.repeat(200), 'png')).toBe('x'.repeat(80) + '.png');
  });
});
