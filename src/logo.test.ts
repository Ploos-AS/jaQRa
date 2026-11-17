import { describe, expect, it } from 'vitest';
import { overlayLogo, validateLogoFile, validateLogoSize } from './logo';
const svg='<svg viewBox="0 0 100 100"></svg>';
const image='data:image/png;base64,aGVsbG8=';
describe('Logo Studio',()=>{
 it('adds logo and background',()=>{const result=overlayLogo(svg,{dataURL:image,sizePercent:12});expect(result).toContain('<image');expect(result).toContain('fill="#ffffff"');});
 it('accepts a PNG logo up to 5 MiB',()=>{
  expect(()=>validateLogoFile(new File([new Uint8Array(5*1024*1024)],'logo.png',{type:'image/png'}))).not.toThrow();
 });
 it('rejects logos larger than 5 MiB',()=>{
  expect(()=>validateLogoFile(new File([new Uint8Array(5*1024*1024+1)],'logo.png',{type:'image/png'}))).toThrow('5 MB');
 });
 it('rejects unsupported logo types',()=>{
  expect(()=>validateLogoFile(new File(['<svg/>'],'logo.svg',{type:'image/svg+xml'}))).toThrow();
 });
 it('rejects oversized overlays',()=>expect(()=>validateLogoSize(30)).toThrow());
 it('rejects SVG payloads as logo',()=>expect(()=>overlayLogo(svg,{dataURL:'data:image/svg+xml;base64,AAAA',sizePercent:12})).toThrow());
});
