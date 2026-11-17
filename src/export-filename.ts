/** Produce a safe, predictable local download name. Never trust user input as a path. */
export function exportFilename(input: string, extension: 'svg' | 'png'): string {
  const name = input.trim()
    .replace(/\.(svg|png)$/i, '')
    .replace(/[\\/<>:"|?*\x00-\x1f\x7f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+|\.+$/g, '')
    .trim()
    .slice(0, 80)
    .replace(/[. ]+$/g, '');
  return `${name || 'jaqra-qr'}.${extension}`;
}
