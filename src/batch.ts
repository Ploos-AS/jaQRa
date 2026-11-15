import { zipSync, strToU8 } from 'fflate';
import { validatePayload } from './qr';

export interface BatchRow { name: string; payload: string }
export function parseCSV(source: string): BatchRow[] {
 if(source.length > 1024*1024) throw new Error('CSV exceeds 1 MB.');
 const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
 const text=source.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
  else if(c==='"'){if(field)throw new Error('Malformed CSV quoting.');quoted=true;}
  else if(c===','){row.push(field);field='';}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(v=>v.trim()))rows.push(row);row=[];}
  else field+=c;
 }
 if(quoted)throw new Error('Unclosed CSV quote.');
 row.push(field);if(row.some(v=>v.trim()))rows.push(row);
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
