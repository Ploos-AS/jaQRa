import {describe,it,expect} from 'vitest';
import {assignCollection,collectionNames,normalizeCollection,removeCollection,parseLibrary,type SavedQR} from './library';
import {exportBackup,importBackup} from './library-backup';
const item=(id:string,collection?:string):SavedQR=>({id,title:'Example',kind:'url',values:{url:'https://example.org'},design:{foreground:'#000000',background:'#ffffff',margin:4},moduleStyle:'square',createdAt:'2026-11-17T00:00:00Z',favorite:false,...(collection?{collection}:{})});
describe('QR collections',()=>{
 it('keeps old records without collections',()=>expect(parseLibrary(JSON.stringify([item('old')]))).toEqual([item('old')]));
 it('normalizes and validates names',()=>{expect(normalizeCollection('  Events  ')).toBe('Events');expect(()=>normalizeCollection('x'.repeat(41))).toThrow();});
 it('lists unique sorted collection names',()=>expect(collectionNames([item('a','Work'),item('b','Events'),item('c','Work')])).toEqual(['Events','Work']));
 it('assigns and unfiles without mutating originals',()=>{const original=[item('a'),item('b','Work')];const assigned=assignCollection(original,'a','Events');expect(assigned[0].collection).toBe('Events');expect(original[0].collection).toBeUndefined();expect(removeCollection(assigned,'Events')[0].collection).toBeUndefined();expect(removeCollection(assigned,'Events')[1].collection).toBe('Work');});
 it('preserves collection data in version 1 JSON backups',()=>expect(importBackup(exportBackup([item('a','Events')]))).toEqual([item('a','Events')]));
 it('rejects invalid collection metadata',()=>expect(parseLibrary(JSON.stringify([{...item('a'),collection:'x'.repeat(41)}]))).toEqual([]));
});
