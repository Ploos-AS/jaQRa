import './style.css';
import { renderSVG, renderPNG } from './qr';
import { buildPayload, fields, type QRKind } from './payloads';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <header><div class="brand">ja<span>QR</span>a</div><div class="tagline">Every QR. One Place.</div></header>
  <section class="hero"><div class="eyebrow">FREE • PRIVATE • LOCAL-FIRST</div><h1>Make a QR code.<br><em>Make it yours.</em></h1><p>Create high-quality QR codes in your browser. No account. No tracking. No expiration.</p></section>
  <section class="workspace" aria-label="QR code creator">
    <div class="controls"><h2>Create your code</h2><label for="kind">QR code type</label><select id="kind"><option value="url">Website URL</option><option value="text">Plain text</option><option value="wifi">Wi-Fi</option><option value="vcard">Contact (vCard)</option><option value="email">Email</option><option value="sms">SMS</option><option value="phone">Phone</option><option value="geo">Location</option></select><div id="fields"></div>
    <label for="color">QR code color</label><input id="color" type="color" value="#12243c">
    <p class="hint">Your content stays in this browser. Static QR codes do not expire.</p><p class="error" id="error" role="alert" aria-live="polite"></p></div>
    <div class="result"><div class="preview" id="preview" aria-label="QR code preview"><span>Enter a URL or text to preview your QR code.</span></div>
    <div class="actions"><button id="svg" disabled>Download SVG</button><button id="png" disabled>Download PNG</button></div></div>
  </section>
  <footer>Made by Ploos AS · Privacy-first QR generation</footer>
`;
const kind = document.querySelector<HTMLSelectElement>('#kind')!;
const inputs = document.querySelector<HTMLDivElement>('#fields')!;
const color = document.querySelector<HTMLInputElement>('#color')!;
const preview = document.querySelector<HTMLDivElement>('#preview')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const svgButton = document.querySelector<HTMLButtonElement>('#svg')!;
const pngButton = document.querySelector<HTMLButtonElement>('#png')!;
let latestSVG = '';
let latestPayload = '';
function values(): Record<string,string> { const out:Record<string,string>={}; inputs.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-field]').forEach(el=>out[el.dataset.field!]=el instanceof HTMLInputElement && el.type==='checkbox'?String(el.checked):el.value); return out; }
function makeFields(){ inputs.replaceChildren(); for(const [key,label,type] of fields[kind.value as QRKind]) { const wrap=document.createElement('div'); const lbl=document.createElement('label');lbl.htmlFor='field-'+key;lbl.textContent=label; let el:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement; if(type==='textarea')el=document.createElement('textarea'); else if(type==='select'){const select=document.createElement('select');for(const option of ['WPA','WEP','nopass']){const item=document.createElement('option');item.value=option;item.textContent=option==='nopass'?'Open (no password)':option;select.append(item);}el=select;} else {const input=document.createElement('input');input.type=type;el=input;}el.id='field-'+key;el.dataset.field=key;wrap.append(lbl,el);inputs.append(wrap); } void update(); }
let request = 0;
async function update() {
  const current = ++request;
  try {
    const text = buildPayload(kind.value as QRKind, values());
    const svg = await renderSVG(text, color.value);
    if (current !== request) return;
    latestSVG = svg;
    latestPayload = text;
    preview.innerHTML = svg;
    error.textContent = '';
    svgButton.disabled = false;
    pngButton.disabled = false;
  } catch (err) {
    if (current !== request) return;
    latestSVG = '';
    latestPayload = '';
    preview.textContent = 'Enter a URL or text to preview your QR code.';
    error.textContent = err instanceof Error ? err.message : 'Could not generate QR code.';
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
kind.addEventListener('change', makeFields);
inputs.addEventListener('input', update);
inputs.addEventListener('change', update);
color.addEventListener('input', update);
svgButton.addEventListener('click', () => { if (latestSVG) download(new Blob([latestSVG], { type: 'image/svg+xml' }), 'jaqra-qr.svg'); });
pngButton.addEventListener('click', async () => {
  try {
    const png = await renderPNG(latestPayload, color.value);
    const response = await fetch(png);
    download(await response.blob(), 'jaqra-qr.png');
  } catch { error.textContent = 'Unable to export PNG.'; }
});
makeFields();
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
