import { describe, expect, it } from 'vitest';
import { qrContentInsights } from './content-insights';

describe('qrContentInsights', () => {
  it('reports empty and singular content accurately', () => {
    expect(qrContentInsights('')).toBe('Encoded content: 0 characters · 0 UTF-8 bytes.');
    expect(qrContentInsights('a')).toBe('Encoded content: 1 character · 1 UTF-8 byte.');
  });
  it('counts Unicode code points separately from UTF-8 bytes', () => {
    expect(qrContentInsights('ø')).toBe('Encoded content: 1 character · 2 UTF-8 bytes.');
    expect(qrContentInsights('😀')).toBe('Encoded content: 1 character · 4 UTF-8 bytes.');
  });
  it('formats long counts for readability', () => {
    expect(qrContentInsights('x'.repeat(1000))).toBe('Encoded content: 1,000 characters · 1,000 UTF-8 bytes.');
  });
});
