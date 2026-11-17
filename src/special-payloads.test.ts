import {describe,it,expect} from 'vitest';
import {buildPayload} from './payloads';
describe('TOTP provisioning QR',()=>{
 const base={issuer:'Example',account:'alice@example.com',secret:'JBSWY3DPEHPK3PXP'};
 it('encodes standard otpauth provisioning',()=>expect(buildPayload('totp',base)).toBe('otpauth://totp/Example:alice%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30'));
 it('supports explicit algorithm and digits',()=>expect(buildPayload('totp',{...base,algorithm:'SHA256',digits:'8',period:'60'})).toContain('algorithm=SHA256&digits=8&period=60'));
 it('rejects malformed Base32 secrets',()=>expect(()=>buildPayload('totp',{...base,secret:'bad$'})).toThrow());
 it('rejects issuer injection',()=>expect(()=>buildPayload('totp',{...base,issuer:'a:b'})).toThrow());
});
describe('GS1 Digital Link QR',()=>{
 const base={baseUrl:'https://example.org',gtin:'09506000134352'};
 it('encodes a valid GTIN',()=>expect(buildPayload('gs1',base)).toBe('https://example.org/01/09506000134352'));
 it('pads GTIN-13 to 14 digits',()=>expect(buildPayload('gs1',{...base,gtin:'9506000134352'})).toBe('https://example.org/01/09506000134352'));
 it('adds serial or lot',()=>expect(buildPayload('gs1',{...base,serial:'ABC123'})).toBe('https://example.org/01/09506000134352/21/ABC123'));
 it('rejects incorrect check digit',()=>expect(()=>buildPayload('gs1',{...base,gtin:'09506000134353'})).toThrow());
 it('rejects insecure resolvers',()=>expect(()=>buildPayload('gs1',{...base,baseUrl:'http://example.org'})).toThrow());
 it('rejects conflicting qualifiers',()=>expect(()=>buildPayload('gs1',{...base,lot:'X',serial:'Y'})).toThrow());
});
