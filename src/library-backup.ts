import {MAX_SAVED,validSavedQR,type SavedQR} from './library';
export const BACKUP_VERSION=1;
export const MAX_BACKUP_BYTES=1024*1024;
export interface LibraryBackup {format:'jaqra-library';version:1;exportedAt:string;entries:SavedQR[]}
export function exportBackup(entries:SavedQR[],now=new Date()):string {
 if(entries.length>MAX_SAVED||!entries.every(validSavedQR))throw new Error('Library contains invalid entries.');
 return JSON.stringify({format:'jaqra-library',version:BACKUP_VERSION,exportedAt:now.toISOString(),entries} satisfies LibraryBackup,null,2);
}
export function importBackup(text:string):SavedQR[] {
 if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)throw new Error('Backup exceeds the 1 MB limit.');
 let data:unknown;
 try{data=JSON.parse(text);}catch{throw new Error('Invalid JSON backup file.');}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid jaQRa backup.');
 const obj=data as Partial<LibraryBackup>;
 if(obj.format!=='jaqra-library'||obj.version!==BACKUP_VERSION)throw new Error('Unsupported backup format or version.');
 if(!Array.isArray(obj.entries)||obj.entries.length>MAX_SAVED||!obj.entries.every(validSavedQR))throw new Error('Backup contains invalid QR entries or exceeds 50 entries.');
 const ids=new Set<string>();
 for(const entry of obj.entries){if(ids.has(entry.id))throw new Error('Backup contains duplicate entry IDs.');ids.add(entry.id);}
 return obj.entries;
}
export function mergeBackup(existing:SavedQR[],incoming:SavedQR[]):SavedQR[] {
 const merged=[...existing];
 for(const item of incoming){
  const idx=merged.findIndex(current=>current.id===item.id);
  if(idx>=0)merged[idx]=item;else merged.push(item);
 }
 if(merged.length>MAX_SAVED)throw new Error('Combined library exceeds 50 entries. Delete some entries or choose Replace.');
 return merged;
}
