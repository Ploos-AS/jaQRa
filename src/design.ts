export interface QRDesign { foreground: string; background: string; margin: number }
export const presets: Record<string, QRDesign> = {
 Classic: { foreground: '#12243c', background: '#ffffff', margin: 4 },
 Midnight: { foreground: '#111827', background: '#f3f4f6', margin: 4 },
 Forest: { foreground: '#064e3b', background: '#ecfdf5', margin: 4 },
 Ocean: { foreground: '#1e3a8a', background: '#eff6ff', margin: 4 },
 Ink: { foreground: '#000000', background: '#ffffff', margin: 4 }
};
function luminance(hex: string): number {
 if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Invalid color value.');
 const channels = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);
 const [r,g,b] = channels.map(c => c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4);
 return 0.2126*r + 0.7152*g + 0.0722*b;
}
export function contrastRatio(a: string,b: string): number {
 const x=luminance(a), y=luminance(b);
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function validateDesign(design: QRDesign): QRDesign {
 if (!Number.isInteger(design.margin) || design.margin < 4 || design.margin > 12) throw new Error('Quiet zone must be between 4 and 12 modules.');
 if (luminance(design.foreground) >= luminance(design.background)) throw new Error('QR modules must be darker than the background.');
 if (contrastRatio(design.foreground,design.background) < 4.5) throw new Error('Increase contrast between the QR code and its background (minimum 4.5:1).');
 return design;
}
