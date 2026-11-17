export type CryptoKind='bitcoin'|'monero'|'ethereum'|'lightning'|'solana'|'litecoin'|'dogecoin'|'bitcoincash';
const amount=(raw:string,decimals:number):string=>{
 const value=raw.trim();
 if(!value)return '';
 if(!new RegExp('^(?:0|[1-9]\\d*)(?:\\.\\d{1,'+decimals+'})?$').test(value)||!/[1-9]/.test(value.replace('.','')))throw new Error('Enter a positive amount with up to '+decimals+' decimal places.');
 return value;
};
const address=(raw:string,label:string,pattern:RegExp):string=>{
 const value=raw.trim();
 if(!pattern.test(value))throw new Error('Invalid '+label+'. Check the address before sharing.');
 return value;
};
export function cryptoPayload(kind:CryptoKind,values:Record<string,string>):string{
 const v=(key:string)=>values[key]||'';
 switch(kind){
  case 'bitcoin':{
   const recipient=address(v('address'),'Bitcoin address',/^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|(?:bc1|BC1)[ac-hj-np-z02-9AC-HJ-NP-Z]{11,87})$/);
   const value=amount(v('amount'),8);
   return 'bitcoin:'+recipient+(value?'?amount='+value:'');
  }
  case 'litecoin':{
   const recipient=address(v('address'),'Litecoin address',/^(?:[LM3][a-km-zA-HJ-NP-Z1-9]{25,34}|(?:ltc1|LTC1)[ac-hj-np-z02-9AC-HJ-NP-Z]{11,87})$/);
   const value=amount(v('amount'),8);
   return 'litecoin:'+recipient+(value?'?amount='+value:'');
  }
  case 'dogecoin':{
   const recipient=address(v('address'),'Dogecoin address',/^D[a-km-zA-HJ-NP-Z1-9]{25,34}$/);
   const value=amount(v('amount'),8);
   return 'dogecoin:'+recipient+(value?'?amount='+value:'');
  }
  case 'bitcoincash':{
   const recipient=address(v('address'),'Bitcoin Cash CashAddr',/^(?:bitcoincash:)?[qp][ac-hj-np-z02-9]{41,}$/);
   const normalized=recipient.startsWith('bitcoincash:')?recipient.slice('bitcoincash:'.length):recipient;
   const value=amount(v('amount'),8);
   return 'bitcoincash:'+normalized+(value?'?amount='+value:'');
  }
  case 'monero':{
   const recipient=address(v('address'),'Monero address',/^[48][1-9A-HJ-NP-Za-km-z]{94}$/);
   const value=amount(v('amount'),12);
   return 'monero:'+recipient+(value?'?tx_amount='+value:'');
  }
  case 'ethereum':{
   const recipient=address(v('address'),'Ethereum address',/^0x[0-9a-fA-F]{40}$/);
   const value=amount(v('amount'),18);
   const chain=v('chainId').trim();
   if(chain&&!/^[1-9]\d{0,14}$/.test(chain))throw new Error('Chain ID must be a positive decimal integer.');
   const target=recipient+(chain?'@'+chain:'');
   if(!value)return 'ethereum:'+target;
   const [whole,fraction='']=value.split('.');
   const wei=(BigInt(whole)*10n**18n+BigInt(fraction.padEnd(18,'0'))).toString();
   return 'ethereum:'+target+'?value='+wei;
  }
  case 'lightning':{
   const invoice=v('invoice').trim();
   if(!/^ln(?:bc|tb|bcrt)[0-9a-z]+$/i.test(invoice)||invoice.length<20)throw new Error('Enter a BOLT11 Lightning invoice.');
   return 'lightning:'+invoice.toLowerCase();
  }
  case 'solana':{
   const recipient=address(v('address'),'Solana address',/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
   const value=amount(v('amount'),9);
   const label=v('label').trim();
   const message=v('message').trim();
   if(label.length>100||message.length>200||/[\r\n]/.test(label+message))throw new Error('Solana label or message is too long or contains newlines.');
   const params=new URLSearchParams();
   if(value)params.set('amount',value);
   if(label)params.set('label',label);
   if(message)params.set('message',message);
   return 'solana:'+recipient+(params.size?'?'+params.toString():'');
  }
 }
}
