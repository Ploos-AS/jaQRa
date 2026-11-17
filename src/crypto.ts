export type CryptoKind='bitcoin'|'monero'|'ethereum'|'lightning'|'solana';
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
  case 'monero':{
   const recipient=address(v('address'),'Monero address',/^[48][1-9A-HJ-NP-Za-km-z]{94}$/);
   const value=amount(v('amount'),12);
   return 'monero:'+recipient+(value?'?tx_amount='+value:'');
  }
  case 'ethereum':{
   const recipient=address(v('address'),'Ethereum address',/^0x[0-9a-fA-F]{40}$/);
   if(v('amount').trim())throw new Error('Ethereum amount requests are not yet supported. Use address-only QR.');
   return 'ethereum:'+recipient;
  }
  case 'lightning':{
   const invoice=v('invoice').trim();
   if(!/^ln(?:bc|tb|bcrt)[0-9a-z]+$/i.test(invoice)||invoice.length<20)throw new Error('Enter a BOLT11 Lightning invoice.');
   return 'lightning:'+invoice.toLowerCase();
  }
  case 'solana':{
   const recipient=address(v('address'),'Solana address',/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
   if(v('amount').trim())throw new Error('Solana amount requests are not yet supported. Use address-only QR.');
   return 'solana:'+recipient;
  }
 }
}
