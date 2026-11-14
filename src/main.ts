import './style.css';
import { renderSVG, renderPNG, validatePayload } from './qr';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <header><div class="brand">ja<span>QR</span>a</div><div class="tagline">Every QR. One Place.</div></header>
  <section class="hero"><div class="eyebrow">FREE • PRIVATE • LOCAL-FIRST</div><h1>Make a QR code.<br><em>Make it yours.</em></h1><p>Create high-quality QR codes in your browser. No account. No tracking. No expiration.</p></section>
  <section class="workspace" aria-label="QR code creator">
    <div class="controls"><h2>Create your code</h2><label for="payload">Website URL or text</label><textarea id="payload" rows="5" placeholder="https://example.com" maxlength="2000"></textarea>
    <label for="color">QR code color</label><input id="color" type="color" value="#12243c">
    <p class="hint">Your content stays in this browser. Static QR codes do not expire.</p><p class="error" id="error" role="alert" aria-live="polite"></p></div>
    <div class="result"><div class="preview" id="preview" aria-label="QR code preview"><span>Enter a URL or text to preview your QR code.</span></div>
    <div class="actions"><button id="svg" disabled>Download SVG</button><button id="png" disabled>Download PNG</button></div></div>
  </section>
  <footer>Made by Ploos AS · Privacy-first QR generation</footer>
`;
const payload = document.querySelector<HTMLTextAreaElement>('#payload')!;
const color = document.querySelector<HTMLInputElement>('#color')!;
const preview = document.querySelector<HTMLDivElement>('#preview')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const svgButton = document.querySelector<HTMLButtonElement>('#svg')!;
const pngButton = document.querySelector<HTMLButtonElement>('#png')!;
let latestSVG = '';
let request = 0;
async function update() {
  const current = ++request;
  try {
    const text = validatePayload(payload.value);
    const svg = await renderSVG(text, color.value);
    if (current !== request) return;
    latestSVG = svg;
    preview.innerHTML = svg;
    error.textContent = '';
    svgButton.disabled = false;
    pngButton.disabled = false;
  } catch (err) {
    if (current !== request) return;
    latestSVG = '';
    preview.textContent = 'Enter a URL or text to preview your QR code.';
    error.textContent = payload.value.trim() ? (err instanceof Error ? err.message : 'Could not generate QR code.') : '';
    svgButton.disabled = true;
    pngButton.disabled = true;
  }
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
payload.addEventListener('input', update);
color.addEventListener('input', update);
svgButton.addEventListener('click', () => { if (latestSVG) download(new Blob([latestSVG], { type: 'image/svg+xml' }), 'jaqra-qr.svg'); });
pngButton.addEventListener('click', async () => {
  try {
    const png = await renderPNG(payload.value, color.value);
    const response = await fetch(png);
    download(await response.blob(), 'jaqra-qr.png');
  } catch { error.textContent = 'Unable to export PNG.'; }
});
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
