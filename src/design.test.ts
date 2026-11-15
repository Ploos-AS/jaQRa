import { describe, expect, it } from 'vitest';
import { contrastRatio, presets, validateDesign } from './design';
import { renderSVG, renderPNG } from './qr';
describe('QR Design Studio', () => {
 it('accepts accessible dark-on-light presets',()=>Object.values(presets).forEach(p=>expect(validateDesign(p)).toEqual(p)));
 it('rejects insufficient contrast',()=>expect(()=>validateDesign({foreground:'#eeeeee',background:'#ffffff',margin:4})).toThrow());
 it('rejects inverted colors',()=>expect(()=>validateDesign({foreground:'#ffffff',background:'#000000',margin:4})).toThrow());
 it('enforces quiet zone',()=>expect(()=>validateDesign({foreground:'#000000',background:'#ffffff',margin:1})).toThrow());
 it('measures contrast',()=>expect(contrastRatio('#000000','#ffffff')).toBeCloseTo(21));
 it('exports SVG with background',async()=>expect(await renderSVG('hello',presets.Forest)).toContain('#ecfdf5'));
 it('exports PNG',async()=>expect(await renderPNG('hello',presets.Classic)).toMatch(/^data:image\/png;base64,/));
});
