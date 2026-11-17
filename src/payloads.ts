import { totpPayload, gs1DigitalLink } from './special-payloads';
import { mecard, calendarEvent, sepaPayment } from './extended-payloads';
import { cryptoPayload } from './crypto';
export type QRKind = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone' | 'geo' | 'bitcoin' | 'monero' | 'ethereum' | 'lightning' | 'solana' | 'mecard' | 'calendar' | 'sepa' | 'litecoin' | 'dogecoin' | 'bitcoincash' | 'totp' | 'gs1';
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
 ethereum: [['address','Ethereum address (0x...)','text'],['amount','Native ETH amount (optional)','text'],['chainId','EVM chain ID (optional, e.g. 1 for Ethereum mainnet)','text']],
 lightning: [['invoice','BOLT11 Lightning invoice','textarea']],
 solana: [['address','Solana receiving address','text'],['amount','SOL amount (optional)','text'],['label','Recipient label (optional)','text'],['message','Payment message (optional)','text']],
 mecard: [['name','Full name','text'],['phone','Phone','tel'],['email','Email','email'],['website','Website','url'],['address','Address','text']],
 calendar: [['title','Event title','text'],['start','Start UTC (YYYYMMDDTHHMMSSZ)','text'],['end','End UTC (YYYYMMDDTHHMMSSZ)','text'],['location','Location (optional)','text'],['description','Description (optional)','textarea']],
 sepa: [['name','Beneficiary name','text'],['iban','IBAN','text'],['bic','BIC (optional)','text'],['amount','EUR amount (optional)','text'],['reference','Payment message (optional)','text']],
 litecoin: [['address','Litecoin receiving address','text'],['amount','Amount in LTC (optional)','text']],
 dogecoin: [['address','Dogecoin receiving address','text'],['amount','Amount in DOGE (optional)','text']],
 bitcoincash: [['address','Bitcoin Cash CashAddr (no legacy addresses)','text'],['amount','Amount in BCH (optional)','text']],
 totp: [['issuer','Service / issuer','text'],['account','Account name','text'],['secret','Existing Base32 TOTP secret (sensitive)','password'],['algorithm','Algorithm (SHA1, SHA256 or SHA512)','text'],['digits','Digits (6 or 8)','text'],['period','Period in seconds (default 30)','text']],
 gs1: [['baseUrl','HTTPS GS1 Digital Link resolver','url'],['gtin','GTIN (8, 12, 13 or 14 digits)','text'],['lot','Batch / lot (optional)','text'],['serial','Serial (optional, instead of lot)','text']]
};
const required = (value: string, label: string) => { if (!value.trim()) throw new Error(label + ' is required.'); return value.trim(); };
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
const vEscape = (s: string) => s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const clean = (s: string) => s.replace(/[\r\n]/g,' ');
export function buildPayload(kind: QRKind, values: Record<string,string>): string {
 const v = (key:string) => values[key] || '';
 switch(kind) {
  case 'totp': return totpPayload(values);
  case 'gs1': return gs1DigitalLink(values);
  case 'mecard': return mecard(values);
  case 'calendar': return calendarEvent(values);
  case 'sepa': return sepaPayment(values);
  case 'bitcoin': case 'monero': case 'ethereum': case 'lightning': case 'solana': case 'litecoin': case 'dogecoin': case 'bitcoincash': return cryptoPayload(kind,values);
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
