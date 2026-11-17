const required=(s:string,label:string)=>{const v=s.trim();if(!v)throw new Error(label+' is required.');return v;};
const oneLine=(s:string,label:string)=>{if(/[\r\n]/.test(s))throw new Error(label+' must be on one line.');return s.trim();};
const meEscape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/([;,:])/g,'\\$1');
const icsEscape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icsDate=(s:string,label:string)=>{const v=required(s,label);if(!/^\d{8}T\d{6}Z$/.test(v))throw new Error(label+' must be UTC YYYYMMDDTHHMMSSZ.');const y=+v.slice(0,4),m=+v.slice(4,6),d=+v.slice(6,8),h=+v.slice(9,11),min=+v.slice(11,13),sec=+v.slice(13,15);const date=new Date(Date.UTC(y,m-1,d,h,min,sec));if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d||date.getUTCHours()!==h||date.getUTCMinutes()!==min||date.getUTCSeconds()!==sec)throw new Error('Invalid '+label+'.');return v;};
export function mecard(values:Record<string,string>):string{
 const name=required(values.name||'','Full name');
 const props=['N:'+meEscape(name)];
 for(const [key,tag] of [['phone','TEL'],['email','EMAIL'],['website','URL'],['address','ADR']] as const){const value=oneLine(values[key]||'',tag);if(value)props.push(tag+':'+meEscape(value));}
 return 'MECARD:'+props.join(';')+';;';
}
export function calendarEvent(values:Record<string,string>):string{
 const title=required(values.title||'','Event title');
 const start=icsDate(values.start||'','Start');const end=icsDate(values.end||'','End');
 if(end<=start)throw new Error('End must be later than start.');
 const uid='jaqra-'+Array.from(new TextEncoder().encode(title+start+end)).reduce((h,b)=>(Math.imul(h,31)+b)>>>0,0).toString(16)+'@local.invalid';
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jaQRa//QR Event//EN','BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+start,'DTSTART:'+start,'DTEND:'+end,'SUMMARY:'+icsEscape(title),...(values.location?[ 'LOCATION:'+icsEscape(values.location)]:[]),...(values.description?['DESCRIPTION:'+icsEscape(values.description)]:[]),'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
export function sepaPayment(values:Record<string,string>):string{
 const name=oneLine(required(values.name||'','Beneficiary name'),'Beneficiary name');
 const iban=required(values.iban||'','IBAN').replace(/\s/g,'').toUpperCase();
 if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)||iban.length>34)throw new Error('Invalid IBAN format.');
 let remainder=0;for(const char of (iban.slice(4)+iban.slice(0,4))){const digits=/[A-Z]/.test(char)?String(char.charCodeAt(0)-55):char;for(const digit of digits)remainder=(remainder*10+Number(digit))%97;}
 if(remainder!==1)throw new Error('Invalid IBAN checksum.');
 if(name.length>70)throw new Error('Beneficiary name exceeds 70 characters.');
 const amount=(values.amount||'').trim();
 if(amount&&!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(amount))throw new Error('Invalid EUR amount.');
 if(amount&&(Number(amount)<=0||Number(amount)>999999999.99))throw new Error('Amount must be positive and within EPC limits.');
 const bic=oneLine(values.bic||'','BIC').toUpperCase();
 if(bic&&!/^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(bic))throw new Error('Invalid BIC.');
 const reference=oneLine(values.reference||'','Reference');
 if(reference.length>35)throw new Error('Reference exceeds 35 characters.');
 const lines=['BCD','002','1','SCT',bic,name,iban,amount?'EUR'+amount:'','','',reference];
 const payload=lines.join('\n');
 if(new TextEncoder().encode(payload).length>331)throw new Error('EPC QR payload exceeds 331 bytes.');
 return payload;
}
