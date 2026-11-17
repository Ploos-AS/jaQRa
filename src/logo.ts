export interface LogoOptions { dataURL: string; sizePercent: number }
export function validateLogoFile(file: File): void {
 if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Use PNG, JPEG or WebP logos.');
 if (file.size > 5*1024*1024) throw new Error('Logo must be 5 MB or smaller.');
}
export function validateLogoSize(percent: number): number {
 if (!Number.isFinite(percent) || percent < 8 || percent > 18) throw new Error('Logo size must be between 8% and 18%.');
 return percent;
}
export function overlayLogo(svg: string, logo: LogoOptions): string {
 const size = validateLogoSize(logo.sizePercent);
 if (!/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(logo.dataURL)) throw new Error('Invalid raster logo.');
 const normalizedSVG=svg.trimEnd();
 const match=normalizedSVG.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
 if(!match || !normalizedSVG.endsWith('</svg>')) throw new Error('Invalid QR SVG.');
 const width=Number(match[1]), height=Number(match[2]);
 const side=Math.min(width,height)*size/100, padding=side*0.14;
 const x=(width-side)/2,y=(height-side)/2;
 const box=`<rect x="${x-padding}" y="${y-padding}" width="${side+2*padding}" height="${side+2*padding}" rx="${padding}" fill="#ffffff"/>`;
 const image=`<image x="${x}" y="${y}" width="${side}" height="${side}" preserveAspectRatio="xMidYMid meet" href="${logo.dataURL}"/>`;
 return normalizedSVG.slice(0,-6)+box+image+'</svg>';
}
export async function readLogo(file: File): Promise<string> {
 validateLogoFile(file);
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Unable to read logo.'));reader.readAsDataURL(file);});
}
