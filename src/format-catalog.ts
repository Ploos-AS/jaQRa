import type {QRKind} from './payloads';
export const categories=['All formats','Web & text','Connectivity','Contact & communication','Location','Cryptocurrency'] as const;
export type FormatCategory=typeof categories[number];
export interface QRFormat {kind:QRKind;label:string;category:Exclude<FormatCategory,'All formats'>;description:string;keywords:string}
export const qrFormats:QRFormat[]=[
 {kind:'url',label:'Website URL',category:'Web & text',description:'HTTP or HTTPS website link',keywords:'link web'},
 {kind:'text',label:'Plain text',category:'Web & text',description:'Any text or custom QR payload',keywords:'raw advanced universal'},
 {kind:'wifi',label:'Wi-Fi',category:'Connectivity',description:'Network name and optional password',keywords:'wireless ssid'},
 {kind:'vcard',label:'Contact (vCard)',category:'Contact & communication',description:'Share contact details',keywords:'person business card'},
 {kind:'email',label:'Email',category:'Contact & communication',description:'Email recipient and message',keywords:'mailto'},
 {kind:'sms',label:'SMS',category:'Contact & communication',description:'Text message recipient',keywords:'message'},
 {kind:'phone',label:'Phone',category:'Contact & communication',description:'Telephone number',keywords:'call tel'},
 {kind:'geo',label:'Location',category:'Location',description:'Geographic coordinates',keywords:'gps latitude longitude'},
 {kind:'bitcoin',label:'Bitcoin (BTC)',category:'Cryptocurrency',description:'Receiving address and optional BTC amount',keywords:'crypto bip21 payment'},
 {kind:'monero',label:'Monero (XMR)',category:'Cryptocurrency',description:'Receiving address or subaddress and optional XMR amount',keywords:'crypto privacy payment'},
 {kind:'ethereum',label:'Ethereum (ETH)',category:'Cryptocurrency',description:'Address-only QR',keywords:'crypto wallet'},
 {kind:'lightning',label:'Bitcoin Lightning (BOLT11)',category:'Cryptocurrency',description:'Existing Lightning invoice',keywords:'crypto btc invoice'},
 {kind:'solana',label:'Solana (SOL)',category:'Cryptocurrency',description:'Address-only QR',keywords:'crypto wallet'}
];
export function filterFormats(query:string,category:FormatCategory='All formats'):QRFormat[]{
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return qrFormats.filter(format=>(category==='All formats'||format.category===category)&&words.every(word=>
  [format.label,format.kind,format.category,format.description,format.keywords].join(' ').toLocaleLowerCase().includes(word)));
}
export function formatByKind(kind:QRKind):QRFormat{
 const found=qrFormats.find(format=>format.kind===kind);
 if(!found)throw new Error('Unknown QR format: '+kind);
 return found;
}
