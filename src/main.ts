import './style.css';
import { renderSVG } from './qr';
import { styledSVG, styledPNG, type ModuleStyle } from './styling';
import { verifySVG } from './verify';
import { presets, contrastRatio, type QRDesign } from './design';
import { buildPayload, fields, type QRKind } from './payloads';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <header><div class="brand">ja<span>QR</span>a</div><div class="tagline">Every QR. One Place.</div></header>
  <section class="hero"><div class="eyebrow">FREE • PRIVATE • LOCAL-FIRST</div><h1>Make a QR code.<br><em>Make it yours.</em></h1><p>Create high-quality QR codes in your browser. No account. No tracking. No expiration.</p></section>
  <section class="workspace" aria-label="QR code creator">
    <div class="controls"><h2>Create your code</h2><label for="kind">QR code type</label><select id="kind"><option value="url">Website URL</option><option value="text">Plain text</option><option value="wifi">Wi-Fi</option><option value="vcard">Contact (vCard)</option><option value="email">Email</option><option value="sms">SMS</option><option value="phone">Phone</option><option value="geo">Location</option></select><div id="fields"></div>
    <h3>Design Studio</h3><label for="preset">Color preset</label><select id="preset"><option>Classic</option><option>Midnight</option><option>Forest</option><option>Ocean</option><option>Ink</option><option value="custom">Custom</option></select><div class="design-colors"><div><label for="color">QR color</label><input id="color" type="color" value="#12243c"></div><div><label for="background">Background</label><input id="background" type="color" value="#ffffff"></div></div><label for="module-style">Module style</label><select id="module-style"><option value="square">Classic squares</option><option value="rounded">Soft rounded</option><option value="dots">Dots</option></select><label for="margin">Quiet zone (modules)</label><input id="margin" type="number" min="4" max="12" step="1" value="4"><p class="hint" id="contrast" aria-live="polite"></p>
    <p class="hint">Your content stays in this browser. Static QR codes do not expire.</p><p class="error" id="error" role="alert" aria-live="polite"></p></div>
    <div class="result"><div class="preview" id="preview" aria-label="QR code preview"><span>Enter a URL or text to preview your QR code.</span></div>
    <p class="hint" id="scan-status" role="status" aria-live="polite"></p><div class="actions"><button id="svg" disabled>Download SVG</button><button id="png" disabled>Download PNG</button></div></div>
  </section>
  <footer>Made by Ploos AS · Privacy-first QR generation</footer>
`;
const kind = document.querySelector<HTMLSelectElement>('#kind')!;
const inputs = document.querySelector<HTMLDivElement>('#fields')!;
const color = document.querySelector<HTMLInputElement>('#color')!;
const background = document.querySelector<HTMLInputElement>('#background')!;
const margin = document.querySelector<HTMLInputElement>('#margin')!;
const preset = document.querySelector<HTMLSelectElement>('#preset')!;
const moduleStyle = document.querySelector<HTMLSelectElement>('#module-style')!;
const contrast = document.querySelector<HTMLParagraphElement>('#contrast')!;
function design(): QRDesign { return {foreground:color.value,background:background.value,margin:Number(margin.value)}; }
const preview = document.querySelector<HTMLDivElement>('#preview')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const scanStatus = document.querySelector<HTMLParagraphElement>('#scan-status')!;
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
    const currentDesign = design();
    contrast.textContent = 'Contrast: '+contrastRatio(currentDesign.foreground,currentDesign.background).toFixed(1)+':1';
    const svg = moduleStyle.value === 'square' ? await renderSVG(text, currentDesign) : styledSVG(text, currentDesign, moduleStyle.value as ModuleStyle);
    if (current !== request) return;
    latestSVG = '';
    latestPayload = '';
    preview.innerHTML = svg;
    scanStatus.textContent = 'Checking scannability…';
    svgButton.disabled = true;
    pngButton.disabled = true;
    const check = await verifySVG(svg, text);
    if (current !== request) return;
    scanStatus.textContent = check.message;
    error.textContent = '';
    if (check.valid) { latestSVG = svg; latestPayload = text; svgButton.disabled = false; pngButton.disabled = false; }
  } catch (err) {
    if (current !== request) return;
    latestSVG = '';
    latestPayload = '';
    scanStatus.textContent = '';
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
color.addEventListener('input', () => {preset.value='custom';void update();});
background.addEventListener('input', () => {preset.value='custom';void update();});
margin.addEventListener('input', update);
moduleStyle.addEventListener('change', update);
preset.addEventListener('change', () => {const p=presets[preset.value];if(p){color.value=p.foreground;background.value=p.background;margin.value=String(p.margin);}void update();});
svgButton.addEventListener('click', () => { if (latestSVG) download(new Blob([latestSVG], { type: 'image/svg+xml' }), 'jaqra-qr.svg'); });
pngButton.addEventListener('click', async () => {
  try {
    if (!latestSVG || !latestPayload) return;
    const png = await styledPNG(latestSVG);
    const response = await fetch(png);
    download(await response.blob(), 'jaqra-qr.png');
  } catch { error.textContent = 'Unable to export PNG.'; }
});
makeFields();
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
