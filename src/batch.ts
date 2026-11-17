import { zipSync, strToU8 } from 'fflate';
import { validatePayload } from './qr';

export interface BatchRow { name: string; payload: string }
export function parseCSV(source: string): BatchRow[] {
 if(source.length > 1024*1024) throw new Error('CSV exceeds 1 MB.');
 const rows:string[][]=[];
 let row:string[]=[],field='',state:'start'|'unquoted'|'quoted'|'closed'='start';
 const text=source.replace(/^\\uFEFF/,'');
 const pushField=()=>{row.push(field);field='';state='start';};
 const pushRow=()=>{pushField();if(row.some(v=>v.trim()))rows.push(row);row=[];};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(state==='quoted'){
   if(c==='"'&&text[i+1]==='"'){field+='"';i++;}
   else if(c==='"')state='closed';
   else field+=c;
   continue;
  }
  if(c===','){pushField();continue;}
  if(c==='\\n'||c==='\\r'){
   if(c==='\\r'&&text[i+1]==='\\n')i++;
   pushRow();continue;
  }
  if(state==='closed')throw new Error('Unexpected text after closing CSV quote.');
  if(c==='"'){
   if(state!=='start')throw new Error('Malformed CSV quoting.');
   state='quoted';continue;
  }
  field+=c;state='unquoted';
 }
 if(state==='quoted')throw new Error('Unclosed CSV quote.');
 pushRow();
 if(!rows.length)throw new Error('CSV is empty.');
 const header=rows.shift()!.map(x=>x.trim().toLowerCase());
 const nameCol=header.indexOf('name'),valueCol=header.indexOf('payload');
 if(valueCol<0)throw new Error('CSV needs a payload column (and optional name column).');
 if(rows.length>100)throw new Error('Maximum 100 QR codes per batch.');
 return rows.map((cols,index)=>{
  if(cols.length!==header.length)throw new Error('Wrong column count on data row '+(index+2)+'.');
  const payload=validatePayload(cols[valueCol]);
  const name=(nameCol>=0?cols[nameCol]:'')?.trim()||'qr-'+String(index+1).padStart(3,'0');
  return {name,payload};
 });
}
export function batchZip(entries: Array<{name:string;svg:string}>):Uint8Array {
 const files:Record<string,Uint8Array>={};
 entries.forEach((entry,i)=>{const safe=entry.name.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,48)||'qr';files[String(i+1).padStart(3,'0')+'-'+safe+'.svg']=strToU8(entry.svg);});
 return zipSync(files,{level:6});
}

export type BatchFormat = 'svg' | 'png';
export function batchFilesZip(entries:Array<{name:string;data:Uint8Array}>,format:BatchFormat):Uint8Array {
 const files:Record<string,Uint8Array>={};
 entries.forEach((entry,i)=>{
  const safe=entry.name.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,48)||'qr';
  files[String(i+1).padStart(3,'0')+'-'+safe+'.'+format]=entry.data;
 });
 return zipSync(files,{level:6});
}
