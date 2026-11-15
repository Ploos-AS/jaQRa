import {describe,it,expect} from 'vitest';
import {unzipSync,strFromU8} from 'fflate';
import {batchFilesZip} from './batch';
describe('batch export formats',()=>{
 it('packs PNG binary without altering bytes',()=>{const bytes=new Uint8Array([137,80,78,71,0,255]);const zip=unzipSync(batchFilesZip([{name:'sample',data:bytes}],'png'));expect(Object.keys(zip)).toEqual(['001-sample.png']);expect(zip['001-sample.png']).toEqual(bytes);});
 it('packs SVG as UTF-8',()=>{const zip=unzipSync(batchFilesZip([{name:'example',data:new TextEncoder().encode('<svg/>')}],'svg'));expect(strFromU8(zip['001-example.svg'])).toBe('<svg/>');});
 it('sanitizes names',()=>{const zip=unzipSync(batchFilesZip([{name:'../../evil',data:new Uint8Array([1])}],'png'));expect(Object.keys(zip)[0]).not.toContain('/');});
});
