import {describe,it,expect} from 'vitest';
import {buildPayload} from './payloads';
const eth='0x'+'a'.repeat(40);
const sol='11111111111111111111111111111111';
describe('EIP-681 native ETH transfers',()=>{
 it('encodes native ETH as exact integer wei',()=>expect(buildPayload('ethereum',{address:eth,amount:'0.5'})).toBe('ethereum:'+eth+'?value=500000000000000000'));
 it('encodes smallest wei without floating-point loss',()=>expect(buildPayload('ethereum',{address:eth,amount:'0.000000000000000001',chainId:'1'})).toBe('ethereum:'+eth+'@1?value=1'));
 it('preserves address-only URI',()=>expect(buildPayload('ethereum',{address:eth})).toBe('ethereum:'+eth));
 it('supports explicit chain ID without amount',()=>expect(buildPayload('ethereum',{address:eth,chainId:'137'})).toBe('ethereum:'+eth+'@137'));
 it('rejects excess ETH decimals',()=>expect(()=>buildPayload('ethereum',{address:eth,amount:'0.0000000000000000001'})).toThrow());
 it('rejects malformed chain IDs',()=>expect(()=>buildPayload('ethereum',{address:eth,chainId:'1?value=9'})).toThrow());
});
describe('Solana Pay transfers',()=>{
 it('encodes SOL amount, label and message',()=>expect(buildPayload('solana',{address:sol,amount:'1.25',label:'Shop',message:'Order 42'})).toBe('solana:'+sol+'?amount=1.25&label=Shop&message=Order+42'));
 it('keeps address-only URI',()=>expect(buildPayload('solana',{address:sol})).toBe('solana:'+sol));
 it('rejects overprecision and zero amounts',()=>{for(const amount of ['0','0.0000000001'])expect(()=>buildPayload('solana',{address:sol,amount})).toThrow();});
 it('rejects newline injection',()=>expect(()=>buildPayload('solana',{address:sol,label:'Shop\nunsafe'})).toThrow());
});
