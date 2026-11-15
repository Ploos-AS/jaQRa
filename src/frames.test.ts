import {describe,it,expect} from 'vitest';
import {frameCopy,frameTemplates} from './frames';
describe('print frame templates',()=>{
 it('provides five templates',()=>expect(Object.keys(frameTemplates)).toHaveLength(5));
 it('uses default copy for empty fields',()=>expect(frameCopy('wifi','','').title).toBe('Connect to Wi-Fi'));
 it('limits user copy length',()=>expect(frameCopy('simple','a'.repeat(90),'b'.repeat(130)).title).toHaveLength(70));
});
