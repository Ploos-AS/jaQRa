import jsQR from 'jsqr';

export const MAX_SCAN_BYTES = 10 * 1024 * 1024;

export function validateScanFile(file: Pick<File,'type'|'size'>): void {
 if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG or WebP image.');
 if (file.size > MAX_SCAN_BYTES) throw new Error('Image must be 10 MB or smaller.');
 if (file.size === 0) throw new Error('Image is empty.');
}

export function decodedText(pixels: ImageData): string | null {
 return jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'})?.data ?? null;
}

export async function scanImage(file: File): Promise<string | null> {
 validateScanFile(file);
 const bitmap=await createImageBitmap(file);
 try {
  const maxSide=2048;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Canvas is unavailable.');
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  return decodedText(ctx.getImageData(0,0,canvas.width,canvas.height));
 } finally { bitmap.close(); }
}

export function safeWebURL(value:string):string|null {
 try {
  const url=new URL(value);
  return url.protocol==='https:'||url.protocol==='http:'?url.href:null;
 } catch { return null; }
}
