import QRCode from 'qrcode';

export function validatePayload(value: string): string {
  const text = value.trim();
  if (!text) throw new Error('Enter text or a URL to create a QR code.');
  if (new TextEncoder().encode(text).length > 2000) throw new Error('Payload is too long (maximum 2,000 UTF-8 bytes).');
  return text;
}

export async function renderSVG(value: string, foreground = '#12243c'): Promise<string> {
  return QRCode.toString(validatePayload(value), { type: 'svg', errorCorrectionLevel: 'H', margin: 4, color: { dark: foreground, light: '#ffffff' }, width: 512 });
}

export async function renderPNG(value: string, foreground = '#12243c'): Promise<string> {
  return QRCode.toDataURL(validatePayload(value), { type: 'image/png', errorCorrectionLevel: 'H', margin: 4, color: { dark: foreground, light: '#ffffff' }, width: 1024 });
}
