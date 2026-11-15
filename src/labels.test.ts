import {describe,it,expect} from 'vitest';
import {defaultPaper,labelLayout,labelGrid,paperSizes} from './labels';
describe('label layouts',()=>{
 it('defaults US and Canada to Letter',()=>{expect(defaultPaper('en-US')).toBe('letter');expect(defaultPaper('en-CA')).toBe('letter');});
 it('defaults other locales to A4',()=>{expect(defaultPaper('nb-NO')).toBe('a4');expect(defaultPaper('en-GB')).toBe('a4');});
 it('defines correct paper dimensions',()=>{expect(paperSizes.a4.width).toBe(210);expect(paperSizes.letter.height).toBe(279.4);});
 it('fits 10 labels on a page',()=>{const layout=labelLayout('letter',10);expect(labelGrid(10)).toEqual({columns:2,rows:5});expect(layout.cellWidth).toBeGreaterThan(0);expect(layout.cellHeight).toBeGreaterThan(0);});
});
