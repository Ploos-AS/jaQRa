import {describe,it,expect} from 'vitest';
import {QRValidationState} from './validation-state';
describe('QR validation request guard',()=>{
 it('starts without exportable QR data',()=>{const state=new QRValidationState();expect(state.current).toBeNull();});
 it('accepts only the newest request',()=>{const state=new QRValidationState();const old=state.invalidate();const newest=state.invalidate();expect(state.accept(old,'old-svg','old')).toBe(false);expect(state.accept(newest,'new-svg','new')).toBe(true);expect(state.current).toEqual({svg:'new-svg',payload:'new'});});
 it('clears previously verified export immediately on input change',()=>{const state=new QRValidationState();const token=state.invalidate();state.accept(token,'svg','secret');state.invalidate();expect(state.current).toBeNull();expect(state.isCurrent(token)).toBe(false);});
 it('rejects late async validation results',async()=>{const state=new QRValidationState();const old=state.invalidate();let finish!:()=>void;const pending=new Promise<void>(resolve=>{finish=resolve;});const late=pending.then(()=>state.accept(old,'stale-svg','stale-data'));const fresh=state.invalidate();expect(state.accept(fresh,'fresh-svg','fresh-data')).toBe(true);finish();expect(await late).toBe(false);expect(state.current?.payload).toBe('fresh-data');});
 it('rejects export after switching QR type',()=>{const state=new QRValidationState();const old=state.invalidate();state.invalidate();expect(state.accept(old,'url-svg','url')).toBe(false);expect(state.current).toBeNull();});
});
