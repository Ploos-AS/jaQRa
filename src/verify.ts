import jsQR from 'jsqr';

export interface ScanResult { valid: boolean; message: string }
export function compareDecoded(expected: string, decoded: string | null): ScanResult {
 if(decoded === null) return {valid:false,message:'QR code could not be decoded. Try Classic squares or stronger contrast.'};
 if(decoded !== expected) return {valid:false,message:'Decoded content does not match. Please change the design.'};
 return {valid:true,message:'QR code decoded successfully in the browser. Test with your target camera before printing.'};
}
export async function verifySVG(svg: string, expected: string): Promise<ScanResult> {
 const blob = new Blob([svg],{type:'image/svg+xml'});
 const url = URL.createObjectURL(blob);
 try {
  const img = new Image();
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Unable to load QR preview.'));img.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Canvas is unavailable.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1024,1024);
  ctx.drawImage(img,0,0,1024,1024);
  const pixels=ctx.getImageData(0,0,1024,1024);
  const result=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'dontInvert'});
  return compareDecoded(expected,result?.data ?? null);
 } finally {URL.revokeObjectURL(url);}
}
