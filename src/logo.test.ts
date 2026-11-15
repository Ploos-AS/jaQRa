import { describe, expect, it } from 'vitest';
import { overlayLogo, validateLogoSize } from './logo';
const svg='<svg viewBox="0 0 100 100"></svg>';
const image='data:image/png;base64,aGVsbG8=';
describe('Logo Studio',()=>{
 it('adds logo and background',()=>{const result=overlayLogo(svg,{dataURL:image,sizePercent:12});expect(result).toContain('<image');expect(result).toContain('fill="#ffffff"');});
 it('rejects oversized overlays',()=>expect(()=>validateLogoSize(30)).toThrow());
 it('rejects SVG payloads as logo',()=>expect(()=>overlayLogo(svg,{dataURL:'data:image/svg+xml;base64,AAAA',sizePercent:12})).toThrow());
});
