import {describe,it,expect} from 'vitest';
import {buildPayload} from './payloads';
describe('extended QR formats',()=>{
 it('encodes MeCard fields and escaping',()=>expect(buildPayload('mecard',{name:'Doe, Jane',phone:'+4712345678'})).toBe('MECARD:N:Doe\\, Jane;TEL:+4712345678;;'));
 it('rejects newline injection in MeCard',()=>expect(()=>buildPayload('mecard',{name:'Jane',phone:'123\nMECARD:evil'})).toThrow());
 it('encodes UTC iCalendar event',()=>{const result=buildPayload('calendar',{title:'Team meeting',start:'20261201T120000Z',end:'20261201T130000Z',location:'Oslo'});expect(result).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');expect(result).toContain('DTSTART:20261201T120000Z');expect(result).toContain('SUMMARY:Team meeting');expect(result).toContain('END:VCALENDAR');});
 it('rejects invalid calendar ranges',()=>expect(()=>buildPayload('calendar',{title:'Meeting',start:'20261201T130000Z',end:'20261201T120000Z'})).toThrow());
 it('rejects impossible calendar dates',()=>expect(()=>buildPayload('calendar',{title:'Meeting',start:'20260230T120000Z',end:'20260301T120000Z'})).toThrow());
 it('encodes EPC SEPA transfer with checksum-valid IBAN',()=>{const result=buildPayload('sepa',{name:'Jane Doe',iban:'DE89 3704 0044 0532 0130 00',amount:'12.50',reference:'Invoice 42'});const lines=result.split('\n');expect(lines).toEqual(['BCD','002','1','SCT','','Jane Doe','DE89370400440532013000','EUR12.50','','','Invoice 42','']);});
 it('rejects invalid IBAN checksum',()=>expect(()=>buildPayload('sepa',{name:'Jane Doe',iban:'DE89370400440532013001'})).toThrow());
 it('rejects malformed amount',()=>expect(()=>buildPayload('sepa',{name:'Jane Doe',iban:'DE89370400440532013000',amount:'-2'})).toThrow());
});
