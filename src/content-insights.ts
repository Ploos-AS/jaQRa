/** QR payload size indicators; not a claim about final QR symbol capacity. */
export function qrContentInsights(payload: string): string {
  const characters = Array.from(payload).length;
  const bytes = new TextEncoder().encode(payload).length;
  return `Encoded content: ${characters.toLocaleString('en-US')} character${characters === 1 ? '' : 's'} · ${bytes.toLocaleString('en-US')} UTF-8 byte${bytes === 1 ? '' : 's'}.`;
}
