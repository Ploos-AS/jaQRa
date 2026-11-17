import {describe,it,expect} from 'vitest';
import {addSaved,parseLibrary,removeSaved,toggleFavorite,MAX_SAVED,type SavedQR} from './library';
const entry=(id:string):SavedQR=>({id,title:'Example',kind:'url',values:{url:'https://example.com'},design:{foreground:'#000000',background:'#ffffff',margin:4},moduleStyle:'square',createdAt:'2026-11-17T00:00:00Z',favorite:false});
describe('local QR library',()=>{
 it('starts empty and ignores invalid data',()=>{expect(parseLibrary(null)).toEqual([]);expect(parseLibrary('{bad')).toEqual([]);expect(parseLibrary(JSON.stringify([null,{foo:1},entry('a')]))).toEqual([entry('a')]);});
 it('adds newest first and bounds storage',()=>{let items:SavedQR[]=[];for(let i=0;i<MAX_SAVED+5;i++)items=addSaved(items,entry(String(i)));expect(items).toHaveLength(MAX_SAVED);expect(items[0].id).toBe(String(MAX_SAVED+4));});
 it('toggles favorites without mutating other entries',()=>{const items=[entry('a'),entry('b')];const result=toggleFavorite(items,'a');expect(result[0].favorite).toBe(true);expect(result[1].favorite).toBe(false);expect(items[0].favorite).toBe(false);});
 it('removes only selected item',()=>expect(removeSaved([entry('a'),entry('b')],'a').map(x=>x.id)).toEqual(['b']));
 it('rejects invalid entry types',()=>expect(()=>addSaved([], {...entry('a'),kind:'invalid' as SavedQR['kind']})).toThrow());
});
