import QRCode from 'qrcode';
import { validatePayload } from './qr';
import { validateDesign, type QRDesign } from './design';

export type ModuleStyle = 'square' | 'rounded' | 'dots';

export function styledSVG(value: string, design: QRDesign, style: ModuleStyle): string {
 const data = validatePayload(value);
 const { foreground, background, margin } = validateDesign(design);
 const qr = QRCode.create(data, { errorCorrectionLevel: 'H' });
 const count = qr.modules.size;
 const cell = 10;
 const total = (count + margin * 2) * cell;
 const shapes: string[] = [];
 for(let y=0;y<count;y++) for(let x=0;x<count;x++) {
  if(!qr.modules.get(x,y)) continue;
  // Finder and timing patterns remain square to preserve recognizability.
  const protectedModule = (x<9 && y<9) || (x>=count-9 && y<9) || (x<9 && y>=count-9) || x===6 || y===6;
  const kind = protectedModule ? 'square' : style;
  const px=(x+margin)*cell, py=(y+margin)*cell;
  if(kind==='dots') shapes.push(`<circle cx="${px+5}" cy="${py+5}" r="4.7"/>`);
  else shapes.push(`<rect x="${px}" y="${py}" width="10" height="10"${kind==='rounded'?' rx="2.3"':''}/>`);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="512" height="512" role="img" aria-label="QR code"><rect width="${total}" height="${total}" fill="${background}"/><g fill="${foreground}">${shapes.join('')}</g></svg>`;
}
export async function styledPNG(svg: string): Promise<string> {
 const blob = new Blob([svg], {type:'image/svg+xml'});
 const url = URL.createObjectURL(blob);
 try {
  const img = new Image();
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Could not rasterize QR code.'));img.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');
  ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,1024,1024);
  return canvas.toDataURL('image/png');
 } finally {URL.revokeObjectURL(url);}
}
