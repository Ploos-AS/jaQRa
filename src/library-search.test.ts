import {describe,it,expect} from 'vitest';
import {filterAndSortLibrary} from './library-search';
import type {SavedQR} from './library';
const qr=(id:string,title:string,kind:SavedQR['kind'],createdAt:string,favorite=false):SavedQR=>({id,title,kind,createdAt,favorite,values:{},design:{foreground:'#000000',background:'#ffffff',margin:4},moduleStyle:'square'});
const data=[qr('1','Zebra','url','2026-11-15T00:00:00Z'),qr('2','alpha','wifi','2026-11-17T00:00:00Z',true),qr('3','Beta','url','2026-11-16T00:00:00Z',true)];
const ids=(items:SavedQR[])=>items.map(x=>x.id);
describe('QR library search',()=>{
 it('defaults to newest first',()=>expect(ids(filterAndSortLibrary(data,'',false,'newest'))).toEqual(['2','3','1']));
 it('searches names case insensitively',()=>expect(ids(filterAndSortLibrary(data,'ALP',false,'newest'))).toEqual(['2']));
 it('searches QR types',()=>expect(ids(filterAndSortLibrary(data,'url',false,'newest'))).toEqual(['3','1']));
 it('combines search and favorites',()=>expect(ids(filterAndSortLibrary(data,'url',true,'newest'))).toEqual(['3']));
 it('sorts oldest, names and type',()=>{expect(ids(filterAndSortLibrary(data,'',false,'oldest'))).toEqual(['1','3','2']);expect(ids(filterAndSortLibrary(data,'',false,'name-asc'))).toEqual(['2','3','1']);expect(ids(filterAndSortLibrary(data,'',false,'name-desc'))).toEqual(['1','3','2']);expect(ids(filterAndSortLibrary(data,'',false,'type'))).toEqual(['3','1','2']);});
 it('does not modify stored order',()=>{filterAndSortLibrary(data,'',false,'name-asc');expect(ids(data)).toEqual(['1','2','3']);});
});
