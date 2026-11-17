import {describe,it,expect} from 'vitest';
import {safeWebURL,validateScanFile} from './scanner';
describe('scanner safety',()=>{
 it('allows only http and https links',()=>{expect(safeWebURL('https://example.org/')).toBe('https://example.org/');expect(safeWebURL('javascript:alert(1)')).toBeNull();expect(safeWebURL('data:text/html,hello')).toBeNull();});
 it('does not treat arbitrary text as URL',()=>expect(safeWebURL('hello world')).toBeNull());
 it('rejects unsupported files',()=>expect(()=>validateScanFile({type:'image/svg+xml',size:123})).toThrow());
 it('rejects oversized and empty files',()=>{expect(()=>validateScanFile({type:'image/png',size:11*1024*1024})).toThrow();expect(()=>validateScanFile({type:'image/png',size:0})).toThrow();});
 it('accepts JPEG and WebP',()=>{expect(()=>validateScanFile({type:'image/jpeg',size:200})).not.toThrow();expect(()=>validateScanFile({type:'image/webp',size:200})).not.toThrow();});
});
