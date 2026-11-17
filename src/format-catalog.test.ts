import {describe,it,expect} from 'vitest';
import {categories,filterFormats,formatByKind,qrFormats} from './format-catalog';
import {fields} from './payloads';
describe('QR format explorer',()=>{
 it('has one entry for every implemented QR type',()=>expect(qrFormats.map(x=>x.kind).sort()).toEqual(Object.keys(fields).sort()));
 it('does not contain duplicate formats',()=>expect(new Set(qrFormats.map(x=>x.kind)).size).toBe(qrFormats.length));
 it('assigns every format to a known category',()=>expect(qrFormats.every(x=>categories.includes(x.category))).toBe(true));
 it('finds Monero by symbol and privacy keyword',()=>{expect(filterFormats('XMR').map(x=>x.kind)).toEqual(['monero']);expect(filterFormats('privacy').map(x=>x.kind)).toContain('monero');});
 it('supports case-insensitive multi-word search',()=>expect(filterFormats('bitcoin lightning').map(x=>x.kind)).toEqual(['lightning']));
 it('filters to a category',()=>expect(filterFormats('','Cryptocurrency').map(x=>x.kind)).toEqual(['bitcoin','monero','ethereum','lightning','solana','litecoin','dogecoin','bitcoincash']));
 it('combines search and category',()=>expect(filterFormats('wifi','Cryptocurrency')).toEqual([]));
 it('describes plain text as custom payload option',()=>expect(formatByKind('text').description).toContain('custom'));
});
