import { describe, expect, it } from 'vitest';
import { styledSVG } from './styling';
import { presets } from './design';
describe('advanced QR styling',()=>{
 it('renders rounded modules',()=>expect(styledSVG('hello',presets.Classic,'rounded')).toContain('rx="2.3"'));
 it('renders dots',()=>expect(styledSVG('hello',presets.Classic,'dots')).toContain('<circle'));
 it('keeps quiet zone',()=>expect(styledSVG('hello',presets.Classic,'square')).toContain('viewBox="0 0'));
 it('rejects empty content',()=>expect(()=>styledSVG('',presets.Classic,'dots')).toThrow());
});
