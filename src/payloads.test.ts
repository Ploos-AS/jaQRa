import { describe, it, expect } from 'vitest';
import { buildPayload } from './payloads';
describe('structured QR payloads',()=>{
 it('formats Wi-Fi escaping',()=>expect(buildPayload('wifi',{ssid:'A;B',password:'p:1',security:'WPA',hidden:'true'})).toBe('WIFI:T:WPA;S:A\\;B;P:p\\:1;H:true;;'));
 it('formats vCard',()=>expect(buildPayload('vcard',{name:'Jane Doe',email:'jane@example.com'})).toContain('BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Jane Doe'));
 it('formats email',()=>expect(buildPayload('email',{email:'jane@example.com',subject:'Hi'})).toContain('mailto:jane@example.com?subject=Hi'));
 it('formats phone',()=>expect(buildPayload('phone',{phone:'+4712345678'})).toBe('tel:+4712345678'));
 it('rejects unsafe URL schemes',()=>expect(()=>buildPayload('url',{url:'javascript:alert(1)'})).toThrow());
 it('rejects invalid geo',()=>expect(()=>buildPayload('geo',{lat:'91',lon:'0'})).toThrow());
});
