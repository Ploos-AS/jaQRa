import {describe,it,expect} from 'vitest';
import {buildPayload} from './payloads';
const ltc='L'+'a'.repeat(33);
const doge='D'+'a'.repeat(33);
const bch='q'+'p'.repeat(41);
describe('additional cryptocurrency QR formats',()=>{
 it('encodes Litecoin address and amount',()=>expect(buildPayload('litecoin',{address:ltc,amount:'1.25'})).toBe('litecoin:'+ltc+'?amount=1.25'));
 it('encodes Dogecoin address and amount',()=>expect(buildPayload('dogecoin',{address:doge,amount:'42'})).toBe('dogecoin:'+doge+'?amount=42'));
 it('encodes Bitcoin Cash CashAddr without duplicate prefix',()=>expect(buildPayload('bitcoincash',{address:'bitcoincash:'+bch,amount:'0.5'})).toBe('bitcoincash:'+bch+'?amount=0.5'));
 it('accepts prefixless Bitcoin Cash CashAddr',()=>expect(buildPayload('bitcoincash',{address:bch})).toBe('bitcoincash:'+bch));
 it('rejects wrong-chain or malformed addresses',()=>{expect(()=>buildPayload('dogecoin',{address:ltc})).toThrow();expect(()=>buildPayload('bitcoincash',{address:'1BoatSLRHtKNngkdXEeobR76b53LETtpyT'})).toThrow();});
 it('rejects invalid amounts',()=>{for(const kind of ['litecoin','dogecoin','bitcoincash'] as const){const address=kind==='litecoin'?ltc:kind==='dogecoin'?doge:bch;expect(()=>buildPayload(kind,{address,amount:'-1'})).toThrow();expect(()=>buildPayload(kind,{address,amount:'0.000000001'})).toThrow();}});
});
