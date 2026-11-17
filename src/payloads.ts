import { cryptoPayload } from './crypto';
export type QRKind = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone' | 'geo' | 'bitcoin' | 'monero' | 'ethereum' | 'lightning' | 'solana';
export const fields: Record<QRKind, Array<[string,string,string]>> = {
 url: [['url','Website URL','url']], text: [['text','Text','textarea']],
 wifi: [['ssid','Network name (SSID)','text'],['password','Password','password'],['security','Security: WPA, WEP or nopass','select'],['hidden','Hidden network','checkbox']],
 vcard: [['name','Full name','text'],['phone','Phone','tel'],['email','Email','email'],['org','Organization','text'],['website','Website','url']],
 email: [['email','Email address','email'],['subject','Subject','text'],['body','Message','textarea']],
 sms: [['phone','Phone number','tel'],['message','Message','textarea']],
 phone: [['phone','Phone number','tel']],
 geo: [['lat','Latitude','text'],['lon','Longitude','text']],
 bitcoin: [['address','Bitcoin receiving address','text'],['amount','Amount in BTC (optional)','text']],
 monero: [['address','Monero receiving address or subaddress','text'],['amount','Amount in XMR (optional)','text']],
 ethereum: [['address','Ethereum address (0x...)','text']],
 lightning: [['invoice','BOLT11 Lightning invoice','textarea']],
 solana: [['address','Solana receiving address','text']]
};
const required = (value: string, label: string) => { if (!value.trim()) throw new Error(label + ' is required.'); return value.trim(); };
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
const vEscape = (s: string) => s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const clean = (s: string) => s.replace(/[\r\n]/g,' ');
export function buildPayload(kind: QRKind, values: Record<string,string>): string {
 const v = (key:string) => values[key] || '';
 switch(kind) {
  case 'bitcoin': case 'monero': case 'ethereum': case 'lightning': case 'solana': return cryptoPayload(kind,values);
  case 'url': { const url = required(v('url'),'Website URL'); const parsed = new URL(url); if (!['http:','https:'].includes(parsed.protocol)) throw new Error('Use an HTTP or HTTPS URL.'); return url; }
  case 'text': return required(v('text'),'Text');
  case 'wifi': { const security = v('security') || 'WPA'; if (!['WPA','WEP','nopass'].includes(security)) throw new Error('Invalid Wi-Fi security type.'); return `WIFI:T:${security};S:${wifiEscape(required(v('ssid'),'Network name'))};P:${security === 'nopass' ? '' : wifiEscape(v('password'))};H:${v('hidden') === 'true' ? 'true' : 'false'};;`; }
  case 'vcard': { const name = required(v('name'),'Full name'); return ['BEGIN:VCARD','VERSION:3.0',`FN:${vEscape(name)}`,...(v('phone') ? [`TEL:${clean(v('phone'))}`] : []),...(v('email') ? [`EMAIL:${clean(v('email'))}`] : []),...(v('org') ? [`ORG:${vEscape(v('org'))}`] : []),...(v('website') ? [`URL:${clean(v('website'))}`] : []),'END:VCARD'].join('\r\n'); }
  case 'email': { const email = required(v('email'),'Email address'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.'); const p = new URLSearchParams(); if(v('subject'))p.set('subject',v('subject')); if(v('body'))p.set('body',v('body')); return 'mailto:'+encodeURIComponent(email).replace('%40','@')+(p.size?'?'+p.toString():''); }
  case 'sms': return 'SMSTO:'+required(clean(v('phone')),'Phone number')+':'+v('message');
  case 'phone': return 'tel:'+required(clean(v('phone')),'Phone number');
  case 'geo': { const lat = Number(required(v('lat'),'Latitude')), lon = Number(required(v('lon'),'Longitude')); if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Invalid coordinates.'); return `geo:${lat},${lon}`; }
 }
}
