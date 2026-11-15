import { describe, expect, it } from 'vitest';
import { compareDecoded } from './verify';
describe('QR verification outcomes',()=>{
 it('accepts matching decoded content',()=>expect(compareDecoded('hello','hello').valid).toBe(true));
 it('rejects missing decoded content',()=>expect(compareDecoded('hello',null).valid).toBe(false));
 it('rejects different decoded content',()=>expect(compareDecoded('hello','other').valid).toBe(false));
});
