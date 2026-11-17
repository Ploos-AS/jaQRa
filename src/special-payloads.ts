const required=(value:string,label:string)=>{const text=value.trim();if(!text)throw new Error(label+' is required.');return text;};
export function totpPayload(values:Record<string,string>):string{
 const issuer=required(values.issuer||'','Issuer');
 const account=required(values.account||'','Account');
 if(/[\r\n:]/.test(issuer)||/[\r\n]/.test(account))throw new Error('Invalid issuer or account name.');
 const secret=required(values.secret||'','TOTP secret').replace(/[ \t-]/g,'').toUpperCase();
 if(!/^[A-Z2-7]{16,}$/.test(secret)||secret.length%8===1||secret.length%8===3||secret.length%8===6)throw new Error('Enter a valid Base32 TOTP secret (at least 16 characters).');
 const digits=values.digits||'6';const period=values.period||'30';
 if(!['6','8'].includes(digits))throw new Error('TOTP digits must be 6 or 8.');
 if(!/^[1-9]\d*$/.test(period)||Number(period)>300)throw new Error('TOTP period must be 1–300 seconds.');
 const algorithm=values.algorithm||'SHA1';
 if(!['SHA1','SHA256','SHA512'].includes(algorithm))throw new Error('Unsupported TOTP algorithm.');
 const label=encodeURIComponent(issuer)+':'+encodeURIComponent(account);
 const params=new URLSearchParams({secret,issuer,algorithm,digits,period});
 return 'otpauth://totp/'+label+'?'+params.toString();
}
export function gs1DigitalLink(values:Record<string,string>):string{
 const gtin=required(values.gtin||'','GTIN');
 if(!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin))throw new Error('GTIN must contain 8, 12, 13 or 14 digits.');
 const digits=gtin.padStart(14,'0');
 const sum=digits.slice(0,-1).split('').reverse().reduce((total,digit,index)=>total+Number(digit)*(index%2===0?3:1),0);
 if((10-sum%10)%10!==Number(digits[13]))throw new Error('Invalid GTIN check digit.');
 const base=required(values.baseUrl||'','GS1 Digital Link resolver URL');
 const parsed=new URL(base);
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('Use an HTTPS resolver URL without credentials, query or fragment.');
 const serial=(values.serial||'').trim();
 if(serial&&(!/^[\x21-\x7e]{1,20}$/.test(serial)||serial.includes('/')))throw new Error('Serial must be 1–20 printable ASCII characters without slash.');
 const lot=(values.lot||'').trim();
 if(lot&&(!/^[\x21-\x7e]{1,20}$/.test(lot)||lot.includes('/')))throw new Error('Lot must be 1–20 printable ASCII characters without slash.');
 if(serial&&lot)throw new Error('Choose either serial or lot for this simplified Digital Link format.');
 const prefix=parsed.href.replace(/\/$/,'');
 return prefix+'/01/'+digits+(serial?'/21/'+encodeURIComponent(serial):lot?'/10/'+encodeURIComponent(lot):'');
}
