import {describe,it,expect} from 'vitest';
import {exportBackup,importBackup,mergeBackup,MAX_BACKUP_BYTES} from './library-backup';
import type {SavedQR} from './library';
const item=(id:string):SavedQR=>({id,title:'My QR',kind:'url',values:{url:'https://example.org'},design:{foreground:'#000000',background:'#ffffff',margin:4},moduleStyle:'square',createdAt:'2026-11-17T00:00:00Z',favorite:false});
describe('library backup',()=>{
 it('roundtrips a versioned backup',()=>expect(importBackup(exportBackup([item('a')]))).toEqual([item('a')]));
 it('rejects malformed JSON and unknown versions',()=>{expect(()=>importBackup('{bad')).toThrow();expect(()=>importBackup(JSON.stringify({format:'jaqra-library',version:2,entries:[]}))).toThrow();});
 it('rejects invalid and duplicate entries',()=>{expect(()=>importBackup(JSON.stringify({format:'jaqra-library',version:1,entries:[{id:'a'}]}))).toThrow();expect(()=>importBackup(exportBackup([item('a'),item('a')]))).toThrow();});
 it('rejects oversized input',()=>expect(()=>importBackup(' '.repeat(MAX_BACKUP_BYTES+1))).toThrow());
 it('merges matching IDs and preserves other items',()=>{const updated={...item('a'),title:'Updated'};expect(mergeBackup([item('a'),item('b')],[updated,item('c')])).toEqual([updated,item('b'),item('c')]);});
 it('rejects merge beyond library capacity',()=>expect(()=>mergeBackup(Array.from({length:50},(_,i)=>item('old'+i)),[item('new')])).toThrow());
});
