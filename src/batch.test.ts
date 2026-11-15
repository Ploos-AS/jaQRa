import { describe,it,expect } from 'vitest';
import { unzipSync,strFromU8 } from 'fflate';
import { parseCSV,batchZip } from './batch';
describe('Batch Studio',()=>{
 it('reads named rows',()=>expect(parseCSV('name,payload\nSite,https://example.com')).toEqual([{name:'Site',payload:'https://example.com'}]));
 it('handles quoted commas and newlines',()=>expect(parseCSV('name,payload\n\"Hello, world\",\"first\nsecond\"')[0].payload).toBe('first\nsecond'));
 it('rejects malformed quotes',()=>expect(()=>parseCSV('payload\n\"bad')).toThrow());
 it('rejects missing payload column',()=>expect(()=>parseCSV('name\nfoo')).toThrow());
 it('rejects more than 100 rows',()=>expect(()=>parseCSV('payload\n'+Array(101).fill('hello').join('\n'))).toThrow());
 it('creates a ZIP with safe filenames',()=>{const zip=unzipSync(batchZip([{name:'../unsafe',svg:'<svg/>'}]));expect(strFromU8(Object.values(zip)[0])).toBe('<svg/>');expect(Object.keys(zip)[0]).not.toContain('/');});
});
