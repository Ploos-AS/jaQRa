import {describe,it,expect} from 'vitest';
import {paperSizes,labelLayout} from './labels';
describe('extended paper formats',()=>{
 it('supports A5',()=>expect(paperSizes.a5).toMatchObject({width:148,height:210}));
 it('supports US Legal',()=>expect(paperSizes.legal).toMatchObject({width:215.9,height:355.6}));
 it('supports configurable spacing',()=>{const layout=labelLayout('a5',4,10,3);expect(layout.cellWidth).toBeCloseTo(62.5);});
 it('rejects impossible spacing',()=>expect(()=>labelLayout('a4',10,40,4)).toThrow());
});
