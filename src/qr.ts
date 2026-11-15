import QRCode from 'qrcode';
import { validateDesign, type QRDesign } from './design';

export function validatePayload(value: string): string {
  const text = value.trim();
  if (!text) throw new Error('Enter text or a URL to create a QR code.');
  if (new TextEncoder().encode(text).length > 2000) throw new Error('Payload is too long (maximum 2,000 UTF-8 bytes).');
  return text;
}

export async function renderSVG(value: string, design: QRDesign = { foreground: '#12243c', background: '#ffffff', margin: 4 }): Promise<string> {
  const { foreground, background, margin } = validateDesign(design);
  return QRCode.toString(validatePayload(value), { type: 'svg', errorCorrectionLevel: 'H', margin, color: { dark: foreground, light: background }, width: 512 });
}

export async function renderPNG(value: string, foreground = '#12243c'): Promise<string> {
  const { foreground, background, margin } = validateDesign(design);
  return QRCode.toDataURL(validatePayload(value), { type: 'image/png', errorCorrectionLevel: 'H', margin, color: { dark: foreground, light: background }, width: 1024 });
}
