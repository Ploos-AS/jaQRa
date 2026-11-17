import type {QRKind} from './payloads';
import type {QRDesign} from './design';
import type {ModuleStyle} from './styling';

export const LIBRARY_KEY='jaqra-library-v1';
export const MAX_SAVED=50;
export interface SavedQR {
 id:string; title:string; kind:QRKind; values:Record<string,string>;
 design:QRDesign; moduleStyle:ModuleStyle; createdAt:string; favorite:boolean;
 collection?:string;
}
const kinds=new Set<QRKind>(['url','text','wifi','vcard','email','sms','phone','geo','bitcoin','monero','ethereum','lightning','solana','mecard','calendar','sepa','litecoin','dogecoin','bitcoincash','gs1']);
const styles=new Set<ModuleStyle>(['square','rounded','dots']);
export function validSavedQR(input:unknown):input is SavedQR {
 if(!input||typeof input!=='object')return false;
 const q=input as Partial<SavedQR>;
 return typeof q.id==='string'&&q.id.length>0&&typeof q.title==='string'&&q.title.length<=80&&
 kinds.has(q.kind as QRKind)&&styles.has(q.moduleStyle as ModuleStyle)&&
 typeof q.createdAt==='string'&&typeof q.favorite==='boolean'&&
 (q.collection===undefined||(typeof q.collection==='string'&&q.collection.length<=40&&q.collection.trim()===q.collection))&&
 !!q.design&&typeof q.design.foreground==='string'&&typeof q.design.background==='string'&&
 Number.isInteger(q.design.margin)&&q.design.margin>=4&&q.design.margin<=12&&
 !!q.values&&typeof q.values==='object'&&!Array.isArray(q.values)&&
 Object.values(q.values).every(v=>typeof v==='string');
}
export function parseLibrary(raw:string|null):SavedQR[] {
 if(!raw)return [];
 try{
  const parsed:unknown=JSON.parse(raw);
  if(!Array.isArray(parsed))return [];
  return parsed.filter(validSavedQR).slice(0,MAX_SAVED);
 }catch{return [];}
}
export function addSaved(items:SavedQR[],entry:SavedQR):SavedQR[] {
 if(!validSavedQR(entry))throw new Error('Invalid QR entry.');
 return [entry,...items.filter(item=>item.id!==entry.id)].slice(0,MAX_SAVED);
}
export function toggleFavorite(items:SavedQR[],id:string):SavedQR[] {
 return items.map(item=>item.id===id?{...item,favorite:!item.favorite}:item);
}
export function removeSaved(items:SavedQR[],id:string):SavedQR[] {return items.filter(item=>item.id!==id);}

export function normalizeCollection(name:string):string {
 const trimmed=name.trim();
 if(trimmed.length>40)throw new Error('Collection names must be 40 characters or fewer.');
 return trimmed;
}
export function collectionNames(items:SavedQR[]):string[]{
 return Array.from(new Set(items.map(item=>item.collection||'').filter(Boolean))).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
}
export function assignCollection(items:SavedQR[],id:string,collection:string):SavedQR[]{
 const name=normalizeCollection(collection);
 return items.map(item=>item.id===id?{...item,collection:name||undefined}:item);
}
export function removeCollection(items:SavedQR[],collection:string):SavedQR[]{
 return items.map(item=>item.collection===collection?{...item,collection:undefined}:item);
}
