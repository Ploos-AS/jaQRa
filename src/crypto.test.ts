import {describe,it,expect} from 'vitest';
import {buildPayload} from './payloads';
const btc='1BoatSLRHtKNngkdXEeobR76b53LETtpyT';
const xmr='4'+'A'.repeat(94);
const eth='0x'+'a'.repeat(40);
const sol='11111111111111111111111111111111';
describe('cryptocurrency QR payloads',()=>{
 it('encodes BIP21 bitcoin payment',()=>expect(buildPayload('bitcoin',{address:btc,amount:'0.001'})).toBe('bitcoin:'+btc+'?amount=0.001'));
 it('supports bitcoin address-only',()=>expect(buildPayload('bitcoin',{address:btc})).toBe('bitcoin:'+btc));
 it('encodes Monero payment URI',()=>expect(buildPayload('monero',{address:xmr,amount:'0.5'})).toBe('monero:'+xmr+'?tx_amount=0.5'));
 it('accepts Monero subaddress prefix',()=>expect(buildPayload('monero',{address:'8'+'A'.repeat(94)})).toMatch(/^monero:8/));
 it('supports Ethereum address-only',()=>expect(buildPayload('ethereum',{address:eth})).toBe('ethereum:'+eth));
 it('supports Solana address-only',()=>expect(buildPayload('solana',{address:sol})).toBe('solana:'+sol));
 it('rejects malformed crypto addresses',()=>expect(()=>buildPayload('monero',{address:'bad'})).toThrow());
 it('rejects zero, negative, exponential and overprecision amounts',()=>{for(const value of ['0','-1','1e4','0.000000001'])expect(()=>buildPayload('bitcoin',{address:btc,amount:value})).toThrow();});
 it('rejects lightning invoices that are not BOLT11-shaped',()=>expect(()=>buildPayload('lightning',{invoice:'lnurl1abc'})).toThrow());
});
