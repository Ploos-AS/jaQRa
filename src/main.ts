import './style.css';
import { QRValidationState } from './validation-state';
import { renderSVG } from './qr';
import { styledSVG, styledPNG, type ModuleStyle } from './styling';
import { verifySVG } from './verify';
import { scanImage, safeWebURL } from './scanner';
import { LIBRARY_KEY, MAX_SAVED, parseLibrary, addSaved, toggleFavorite, removeSaved, normalizeCollection, collectionNames, assignCollection, removeCollection, type SavedQR } from './library';
import { exportBackup, importBackup, mergeBackup, MAX_BACKUP_BYTES } from './library-backup';
import { filterAndSortLibrary, type LibrarySort } from './library-search';
import { listCameras, openCamera, stopCamera, decodeVideoFrame } from './camera';
import { parseCSV, batchFilesZip, type BatchFormat } from './batch';
import { defaultPaper, labelLayout, type PaperSize, type LabelCount } from './labels';
import { overlayLogo, readLogo } from './logo';
import { frameTemplates, frameCopy, type FrameTemplate } from './frames';
import { presets, contrastRatio, type QRDesign } from './design';
import { buildPayload, fields, type QRKind } from './payloads';
import { categories, filterFormats, formatByKind } from './format-catalog';

const root = document.querySelector<HTMLDivElement>('#app')!;
function initFormatExplorer():void {
 const kind=document.querySelector<HTMLSelectElement>('#kind')!;
 const category=document.querySelector<HTMLSelectElement>('#format-category')!;
 const search=document.querySelector<HTMLInputElement>('#format-search')!;
 const info=document.querySelector<HTMLElement>('#format-info')!;
 const results=document.querySelector<HTMLElement>('#format-results')!;
 for(const label of categories)category.add(new Option(label,label));
 const updateInfo=()=>{const format=formatByKind(kind.value as QRKind);info.textContent=format.description+'. '+format.category;};
 const render=()=>{
  const selected=kind.value as QRKind;
  const matches=filterFormats(search.value,category.value as typeof categories[number]);
  kind.replaceChildren();
  for(const format of matches)kind.add(new Option(format.label,format.kind));
  if(matches.some(format=>format.kind===selected))kind.value=selected;
  else if(matches.length){kind.value=matches[0].kind;kind.dispatchEvent(new Event('change'));}
  kind.disabled=matches.length===0;
  results.textContent=matches.length?matches.length+' format'+(matches.length===1?'':'s')+' found.':'No matching formats. Clear search or choose another category.';
  if(matches.length)updateInfo();else info.textContent='';
 };
 search.addEventListener('input',render);
 category.addEventListener('change',render);
 kind.addEventListener('change',updateInfo);
 // Keep programmatic library restores discoverable even if a previous filter excludes their type.
 kind.addEventListener('format-reveal',()=>{search.value='';category.value='All formats';render();});
 render();
}

root.innerHTML = `
  <a class="skip-link" href="#qr-creator">Skip to QR creator</a><header><div class="brand">ja<span>QR</span>a</div><div class="tagline">Every QR. One Place.</div></header>
  <section class="hero"><div class="eyebrow">FREE • PRIVATE • LOCAL-FIRST</div><h1>Make a QR code.<br><em>Make it yours.</em></h1><p>Create high-quality QR codes in your browser. No account. No tracking. No expiration.</p></section>
  <section class="workspace" id="qr-creator" aria-label="QR code creator">
    <div class="controls"><h2>Create your code</h2><label for="format-search">Find a QR format</label><input id="format-search" type="search" placeholder="Search: Monero, Wi-Fi, payment…" autocomplete="off"><label for="format-category">Category</label><select id="format-category"></select><label for="kind">QR code type</label><select id="kind"></select><p class="hint" id="format-info" aria-live="polite"></p><p class="hint" id="format-results" role="status"></p><div id="fields"></div>
    <h3>Design Studio</h3><label for="preset">Color preset</label><select id="preset"><option>Classic</option><option>Midnight</option><option>Forest</option><option>Ocean</option><option>Ink</option><option value="custom">Custom</option></select><div class="design-colors"><div><label for="color">QR color</label><input id="color" type="color" value="#12243c"></div><div><label for="background">Background</label><input id="background" type="color" value="#ffffff"></div></div><label for="module-style">Module style</label><select id="module-style"><option value="square">Classic squares</option><option value="rounded">Soft rounded</option><option value="dots">Dots</option></select><label for="margin">Quiet zone (modules)</label><input id="margin" type="number" min="4" max="12" step="1" value="4"><p class="hint" id="contrast" aria-live="polite"></p>
    <h3>Logo Studio</h3><label for="logo-file">Logo (PNG, JPEG or WebP, max 1 MB)</label><input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp"><label for="logo-size">Logo size (8–18%)</label><input id="logo-size" type="range" min="8" max="18" value="12"><button type="button" id="clear-logo">Remove logo</button><p class="hint">Logo is processed locally. Export is enabled only if the QR can be decoded.</p><h3>Print & Frames</h3><label for="frame-template">Frame template</label><select id="frame-template"><option value="simple">Scan me</option><option value="wifi">Wi-Fi sign</option><option value="menu">Restaurant menu</option><option value="event">Event</option><option value="contact">Contact card</option></select><label for="frame-title">Headline</label><input id="frame-title" maxlength="70"><label for="frame-subtitle">Description</label><input id="frame-subtitle" maxlength="120"><p class="hint">Print on A4 or save as PDF using your browser. Only validated codes can be printed.</p><p class="hint">Your content stays in this browser. Static QR codes do not expire.</p><p class="error" id="error" role="alert" aria-live="polite"></p></div>
    <div class="result"><div class="preview" id="preview" role="img" aria-label="QR code preview: enter content to generate a QR code"><span>Enter a URL or text to preview your QR code.</span></div>
    <p class="hint" id="scan-status" role="status" aria-live="polite"></p><div class="actions"><button id="svg" disabled>Download SVG</button><button id="png" disabled>Download PNG</button><button id="print" disabled>Print A4 / Save PDF</button></div><p class="hint" id="export-status" role="status" aria-live="polite"></p></div>
  </section>
  <section class="batch-panel" aria-labelledby="batch-heading"><h2 id="batch-heading">Batch Studio</h2><p>Import a CSV file with <code>name,payload</code> columns (name optional). Up to 100 QR codes.</p><label for="batch-file">CSV file</label><input id="batch-file" type="file" accept=".csv,text/csv"><label for="batch-format">ZIP format</label><select id="batch-format"><option value="svg">SVG</option><option value="png">PNG</option></select><button id="batch-export" type="button">Generate ZIP</button><h3>Print labels</h3><label for="label-paper">Paper size</label><select id="label-paper"><option value="a4">A4</option><option value="letter">US Letter</option><option value="a5">A5</option><option value="legal">US Legal</option></select><label for="label-count">Labels per sheet</label><select id="label-count"><option>1</option><option>2</option><option selected>4</option><option>6</option><option>8</option><option>10</option></select><label for="label-margin">Page margins (mm)</label><input id="label-margin" type="number" min="5" max="25" value="12"><label for="label-gap">Label gap (mm)</label><input id="label-gap" type="number" min="0" max="15" value="4"><button id="label-print" type="button">Print labels / Save PDF</button><p id="batch-status" role="status" aria-live="polite"></p></section>
  <section class="library-panel" aria-labelledby="library-heading"><h2 id="library-heading">My QR Library</h2><p>Save QR designs on this device only. Nothing is saved automatically. Avoid saving passwords or other secrets on shared devices.</p><label for="library-title">Name for this QR code</label><input id="library-title" type="text" maxlength="80" placeholder="e.g. My website"><label for="library-new-collection">Collection (optional)</label><input id="library-new-collection" type="text" maxlength="40" placeholder="e.g. Business, Personal, Events"><button id="library-save" type="button" disabled>Save current QR</button><label for="library-filter">Show</label><select id="library-filter"><option value="all">All saved</option><option value="favorites">Favorites only</option></select><label for="library-search">Search saved codes</label><input id="library-search" type="search" placeholder="Search by name or QR type" autocomplete="off"><label for="library-collection-filter">Collection</label><select id="library-collection-filter"><option value="">All collections</option></select><button id="library-delete-collection" type="button" disabled>Delete selected collection</button><label for="library-sort">Sort by</label><select id="library-sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="type">QR type</option></select><p id="library-count" role="status" aria-live="polite"></p><div id="library-list"></div><h3>Backup &amp; Restore</h3><p>Export a JSON backup to move your saved QR codes between devices. Backups may contain passwords or personal information: store them securely.</p><button id="library-export" type="button">Export JSON backup</button><label for="library-import-file">Import jaQRa backup (.json, max 1 MB)</label><input id="library-import-file" type="file" accept=".json,application/json"><label for="library-import-mode">Import behavior</label><select id="library-import-mode"><option value="merge">Merge with existing library</option><option value="replace">Replace entire library</option></select><button id="library-import" type="button">Import backup</button><hr><button id="library-clear" type="button">Delete all saved codes</button><p id="library-status" role="status" aria-live="polite"></p><p class="hint">Stored in this browser only. Clearing site data also removes your saved codes. Logos are not stored in this version.</p></section>
  <section class="scanner-panel" aria-labelledby="scanner-heading"><h2 id="scanner-heading">QR Scanner Studio</h2><p>Decode an existing QR code from a PNG, JPEG or WebP image. Scanning happens in your browser; your image is not uploaded.</p><label for="scan-file">QR image (max 10 MB)</label><input id="scan-file" type="file" accept="image/png,image/jpeg,image/webp"><button id="scan-image" type="button">Scan image</button><h3>Scan with camera</h3><p>Camera access starts only when you press Start camera. Video stays on this device.</p><label for="camera-choice">Camera</label><select id="camera-choice"><option value="">Default (rear camera preferred)</option></select><button id="camera-start" type="button">Start camera</button><button id="camera-stop" type="button" disabled>Stop camera</button><video id="camera-preview" autoplay muted playsinline hidden aria-label="Live camera QR scanner"></video><p id="scanner-status" role="status" aria-live="polite"></p><label for="scan-result">Decoded content</label><textarea id="scan-result" rows="4" readonly placeholder="Decoded QR content appears here"></textarea><button id="scan-copy" type="button" disabled>Copy decoded content</button><a id="scan-link" target="_blank" rel="noopener noreferrer" hidden>Open website (external)</a><p class="hint">Links are never opened automatically. Check the address before visiting.</p></section>
  <section id="label-sheets" aria-label="Printable batch labels"></section><section id="print-sheet" aria-label="Printable QR sign"><h1 id="print-title"></h1><div id="print-code"></div><p id="print-subtitle"></p></section><footer>Made by Ploos AS · Privacy-first QR generation</footer>
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
const logoFile = document.querySelector<HTMLInputElement>('#logo-file')!;
const logoSize = document.querySelector<HTMLInputElement>('#logo-size')!;
const clearLogo = document.querySelector<HTMLButtonElement>('#clear-logo')!;
let logoData = '';
const exportStatus = document.querySelector<HTMLParagraphElement>('#export-status')!;
const svgButton = document.querySelector<HTMLButtonElement>('#svg')!;
const pngButton = document.querySelector<HTMLButtonElement>('#png')!;
const printButton = document.querySelector<HTMLButtonElement>('#print')!;
const frameTemplate = document.querySelector<HTMLSelectElement>('#frame-template')!;
const frameTitle = document.querySelector<HTMLInputElement>('#frame-title')!;
const frameSubtitle = document.querySelector<HTMLInputElement>('#frame-subtitle')!;
const printTitle = document.querySelector<HTMLElement>('#print-title')!;
const printSubtitle = document.querySelector<HTMLElement>('#print-subtitle')!;
const printCode = document.querySelector<HTMLElement>('#print-code')!;
function updateFrame(){const copy=frameCopy(frameTemplate.value as FrameTemplate,frameTitle.value,frameSubtitle.value);printTitle.textContent=copy.title;printSubtitle.textContent=copy.subtitle;printCode.innerHTML=latestSVG;}
let latestSVG = '';
let latestPayload = '';
function values(): Record<string,string> { const out:Record<string,string>={}; inputs.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-field]').forEach(el=>out[el.dataset.field!]=el instanceof HTMLInputElement && el.type==='checkbox'?String(el.checked):el.value); return out; }
function makeFields(){ invalidateQR(); inputs.replaceChildren(); for(const [key,label,type] of fields[kind.value as QRKind]) { const wrap=document.createElement('div'); const lbl=document.createElement('label');lbl.htmlFor='field-'+key;lbl.textContent=label; let el:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement; if(type==='textarea')el=document.createElement('textarea'); else if(type==='select'){const select=document.createElement('select');for(const option of ['WPA','WEP','nopass']){const item=document.createElement('option');item.value=option;item.textContent=option==='nopass'?'Open (no password)':option;select.append(item);}el=select;} else {const input=document.createElement('input');input.type=type;el=input;}el.id='field-'+key;el.dataset.field=key;wrap.append(lbl,el);inputs.append(wrap); } void update(); }
const validationState = new QRValidationState();
function invalidateQR() {
  validationState.invalidate();
  latestSVG = '';
  latestPayload = '';
  librarySave.disabled = true;
  svgButton.disabled = true;
  pngButton.disabled = true;
  printButton.disabled = true;
}
async function update() {
  invalidateQR();
  const current = validationState.token;
  try {
    const text = buildPayload(kind.value as QRKind, values());
    const currentDesign = design();
    contrast.textContent = 'Contrast: '+contrastRatio(currentDesign.foreground,currentDesign.background).toFixed(1)+':1';
    const baseSVG = moduleStyle.value === 'square' ? await renderSVG(text, currentDesign) : styledSVG(text, currentDesign, moduleStyle.value as ModuleStyle);
    const svg = logoData ? overlayLogo(baseSVG, { dataURL: logoData, sizePercent: Number(logoSize.value) }) : baseSVG;
    if (!validationState.isCurrent(current)) return;
    preview.innerHTML = svg;
    preview.setAttribute('aria-label','QR code preview for '+kind.options[kind.selectedIndex].text+'; verification pending');
    scanStatus.textContent = 'Checking scannability…';
    const check = await verifySVG(svg, text);
    if (!validationState.isCurrent(current)) return;
    scanStatus.textContent = check.message;
    error.textContent = '';
    if (check.valid && validationState.accept(current,svg,text)) { preview.setAttribute('aria-label','Verified QR code preview for '+kind.options[kind.selectedIndex].text); latestSVG = svg; latestPayload = text; librarySave.disabled = false; svgButton.disabled = false; pngButton.disabled = false; printButton.disabled = false; updateFrame(); } else {preview.setAttribute('aria-label','QR code preview failed scannability check');printCode.replaceChildren();}
  } catch (err) {
    if (!validationState.isCurrent(current)) return;
    scanStatus.textContent = '';
    preview.textContent = 'Enter a URL or text to preview your QR code.';
    preview.setAttribute('aria-label','No QR code preview available');
    error.textContent = err instanceof Error ? err.message : 'Could not generate QR code.';
    printCode.replaceChildren();
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
logoSize.addEventListener('input', update);
logoFile.addEventListener('change', async () => {const file=logoFile.files?.[0];if(!file)return;try{logoData=await readLogo(file);void update();}catch(err){logoData='';logoFile.value='';error.textContent=err instanceof Error?err.message:'Invalid logo.';void update();}});
clearLogo.addEventListener('click',()=>{logoData='';logoFile.value='';void update();});
preset.addEventListener('change', () => {const p=presets[preset.value];if(p){color.value=p.foreground;background.value=p.background;margin.value=String(p.margin);}void update();});
svgButton.addEventListener('click', () => {
  if (!latestSVG) return;
  download(new Blob([latestSVG], { type: 'image/svg+xml' }), 'jaqra-qr.svg');
  exportStatus.textContent = 'SVG download started.';
});
pngButton.addEventListener('click', async () => {
  if (!latestSVG || !latestPayload || pngButton.disabled) return;
  const snapshot = latestSVG;
  const exportToken = validationState.token;
  pngButton.disabled = true;
  exportStatus.textContent = 'Preparing PNG…';
  try {
    const png = await styledPNG(snapshot);
    if (!validationState.isCurrent(exportToken) || snapshot !== latestSVG || !latestPayload) {
      exportStatus.textContent = 'QR code changed during export. Please download again.';
      return;
    }
    const response = await fetch(png);
    if (!response.ok) throw new Error('PNG conversion failed');
    const blob = await response.blob();
    if (!validationState.isCurrent(exportToken) || snapshot !== latestSVG || !latestPayload) {
      exportStatus.textContent = 'QR code changed during export. Please download again.';
      return;
    }
    download(blob, 'jaqra-qr.png');
    exportStatus.textContent = 'PNG download started.';
  } catch {
    exportStatus.textContent = 'Unable to export PNG. Try SVG instead.';
  } finally {
    pngButton.disabled = !latestSVG;
  }
});
frameTemplate.addEventListener('change',()=>{const t=frameTemplates[frameTemplate.value as FrameTemplate];frameTitle.value=t.title;frameSubtitle.value=t.subtitle;updateFrame();});
frameTitle.addEventListener('input',updateFrame);
frameSubtitle.addEventListener('input',updateFrame);
printButton.addEventListener('click',()=>{if(!latestSVG)return;updateFrame();window.print();});
const batchFile=document.querySelector<HTMLInputElement>('#batch-file')!;
const batchButton=document.querySelector<HTMLButtonElement>('#batch-export')!;
const batchFormat=document.querySelector<HTMLSelectElement>('#batch-format')!;
const batchStatus=document.querySelector<HTMLParagraphElement>('#batch-status')!;
const labelPaper=document.querySelector<HTMLSelectElement>('#label-paper')!;
const labelCount=document.querySelector<HTMLSelectElement>('#label-count')!;
const labelMargin=document.querySelector<HTMLInputElement>('#label-margin')!;
const labelGap=document.querySelector<HTMLInputElement>('#label-gap')!;
const labelPrint=document.querySelector<HTMLButtonElement>('#label-print')!;
const labelSheets=document.querySelector<HTMLElement>('#label-sheets')!;
labelPaper.value=defaultPaper(navigator.language);
labelPrint.addEventListener('click',async()=>{
 const file=batchFile.files?.[0];if(!file){batchStatus.textContent='Select a CSV file first.';return;}
 labelPrint.disabled=true;
 try{
  const rows=parseCSV(await file.text());if(!rows.length)throw new Error('CSV contains no data rows.');
  const paper=labelPaper.value as PaperSize,count=Number(labelCount.value) as LabelCount;
  const marginMm=Number(labelMargin.value),gapMm=Number(labelGap.value);
  const layout=labelLayout(paper,count,marginMm,gapMm);
  labelSheets.replaceChildren();
  for(let i=0;i<rows.length;i++){
   batchStatus.textContent='Preparing label '+(i+1)+' of '+rows.length+'…';
   const row=rows[i];
   const base=moduleStyle.value==='square'?await renderSVG(row.payload,design()):styledSVG(row.payload,design(),moduleStyle.value as ModuleStyle);
   const svg=logoData?overlayLogo(base,{dataURL:logoData,sizePercent:Number(logoSize.value)}):base;
   const check=await verifySVG(svg,row.payload);
   if(!check.valid)throw new Error('Row '+(i+2)+' failed QR validation: '+check.message);
   if(i%count===0){const sheet=document.createElement('div');sheet.className='label-page';sheet.style.width=layout.page.width+'mm';sheet.style.height=layout.page.height+'mm';sheet.style.gridTemplateColumns='repeat('+layout.columns+',1fr)';sheet.style.gridTemplateRows='repeat('+layout.rows+',1fr)';sheet.style.gap=gapMm+'mm';sheet.style.padding=marginMm+'mm';labelSheets.append(sheet);}
   const cell=document.createElement('div');cell.className='label-cell';
   const code=document.createElement('div');code.className='label-code';code.innerHTML=svg;
   const caption=document.createElement('span');caption.textContent=row.name;
   cell.append(code,caption);labelSheets.lastElementChild!.append(cell);
  }
  document.body.classList.add('printing-labels');
  document.body.dataset.paper=paper;
  batchStatus.textContent='Ready to print '+rows.length+' labels. Select '+layout.page.label+' in your browser print dialog.';
  window.print();
 }catch(err){batchStatus.textContent=err instanceof Error?err.message:'Unable to prepare labels.';labelSheets.replaceChildren();}
 finally{labelPrint.disabled=false;}
});
window.addEventListener('afterprint',()=>{document.body.classList.remove('printing-labels');});
batchButton.addEventListener('click',async()=>{
 const file=batchFile.files?.[0];if(!file){batchStatus.textContent='Select a CSV file first.';return;}
 batchButton.disabled=true;
 try{
  const rows=parseCSV(await file.text());
  if(!rows.length)throw new Error('CSV contains no data rows.');
  const output:Array<{name:string;data:Uint8Array}>=[];
  const format=batchFormat.value as BatchFormat;
  for(let i=0;i<rows.length;i++){
   batchStatus.textContent='Validating '+(i+1)+' of '+rows.length+'…';
   const row=rows[i];
   const base=moduleStyle.value==='square'?await renderSVG(row.payload,design()):styledSVG(row.payload,design(),moduleStyle.value as ModuleStyle);
   const svg=logoData?overlayLogo(base,{dataURL:logoData,sizePercent:Number(logoSize.value)}):base;
   const result=await verifySVG(svg,row.payload);
   if(!result.valid)throw new Error('Row '+(i+2)+' failed QR validation: '+result.message);
   if(format==='png'){
    batchStatus.textContent='Rendering PNG '+(i+1)+' of '+rows.length+'…';
    const dataURL=await styledPNG(svg);
    const bytes=new Uint8Array(await (await fetch(dataURL)).arrayBuffer());
    output.push({name:row.name,data:bytes});
   }else output.push({name:row.name,data:new TextEncoder().encode(svg)});
  }
  download(new Blob([batchFilesZip(output,format) as BlobPart],{type:'application/zip'}),'jaqra-batch-'+format+'.zip');
  batchStatus.textContent='Created '+output.length+' validated QR codes.';
 }catch(err){batchStatus.textContent=err instanceof Error?err.message:'Batch generation failed.';}
 finally{batchButton.disabled=false;}
});
const scanFile=document.querySelector<HTMLInputElement>('#scan-file')!;
const scanButton=document.querySelector<HTMLButtonElement>('#scan-image')!;
const scannerStatus=document.querySelector<HTMLParagraphElement>('#scanner-status')!;
const scanResult=document.querySelector<HTMLTextAreaElement>('#scan-result')!;
const scanCopy=document.querySelector<HTMLButtonElement>('#scan-copy')!;
const scanLink=document.querySelector<HTMLAnchorElement>('#scan-link')!;
scanFile.addEventListener('change',()=>{
 scanResult.value='';scanCopy.disabled=true;scanLink.hidden=true;scanLink.removeAttribute('href');scannerStatus.textContent='';
});
scanButton.addEventListener('click',async()=>{
 const file=scanFile.files?.[0];if(!file){scannerStatus.textContent='Choose an image first.';return;}
 scanButton.disabled=true;scanResult.value='';scanCopy.disabled=true;scanLink.hidden=true;scanLink.removeAttribute('href');
 try{
  scannerStatus.textContent='Scanning locally…';
  const decoded=await scanImage(file);
  if(decoded===null){scannerStatus.textContent='No readable QR code found. Try a sharper image with better lighting.';return;}
  displayScan(decoded);
 }catch(err){scannerStatus.textContent=err instanceof Error?err.message:'Unable to scan image.';}
 finally{scanButton.disabled=false;}
});
scanCopy.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(scanResult.value);scannerStatus.textContent='Copied to clipboard.';}
 catch{scannerStatus.textContent='Clipboard unavailable. Select and copy the decoded content manually.';}
});
const cameraChoice=document.querySelector<HTMLSelectElement>('#camera-choice')!;
const cameraStart=document.querySelector<HTMLButtonElement>('#camera-start')!;
const cameraStop=document.querySelector<HTMLButtonElement>('#camera-stop')!;
const cameraPreview=document.querySelector<HTMLVideoElement>('#camera-preview')!;
const cameraCanvas=document.createElement('canvas');
let cameraStream:MediaStream|null=null;
let cameraTimer:number|undefined;
let cameraStarting=false;
let cameraEpoch=0;
function clearCamera(){
 cameraEpoch++;
 if(cameraTimer!==undefined){window.clearTimeout(cameraTimer);cameraTimer=undefined;}
 stopCamera(cameraStream);cameraStream=null;
 cameraPreview.pause();cameraPreview.srcObject=null;cameraPreview.hidden=true;
 cameraStart.disabled=false;cameraStop.disabled=true;
}
function displayScan(decoded:string){
 scanResult.value=decoded;scanCopy.disabled=false;scanLink.hidden=true;scanLink.removeAttribute('href');
 const url=safeWebURL(decoded);if(url){scanLink.href=url;scanLink.hidden=false;}
 scannerStatus.textContent='QR code decoded. Review the content before using it.';
}
async function refreshCameras(){
 try{
  const previous=cameraChoice.value;
  const cameras=await listCameras();
  cameraChoice.replaceChildren(new Option('Default (rear camera preferred)',''));
  for(const camera of cameras)cameraChoice.add(new Option(camera.label,camera.deviceId));
  if(Array.from(cameraChoice.options).some(option=>option.value===previous))cameraChoice.value=previous;
 }catch{ /* Camera enumeration may be unavailable before permission is granted. */ }
}
function scanCameraFrame(epoch:number){
 if(epoch!==cameraEpoch||!cameraStream)return;
 try{
  const decoded=decodeVideoFrame(cameraPreview,cameraCanvas);
  if(decoded!==null){displayScan(decoded);clearCamera();return;}
 }catch(err){scannerStatus.textContent=err instanceof Error?err.message:'Camera scanning failed.';clearCamera();return;}
 cameraTimer=window.setTimeout(()=>scanCameraFrame(epoch),250);
}
cameraStart.addEventListener('click',async()=>{
 if(cameraStarting||cameraStream)return;
 cameraStarting=true;cameraStart.disabled=true;cameraStop.disabled=false;
 const epoch=++cameraEpoch;
 try{
  scannerStatus.textContent='Requesting camera access…';
  const stream=await openCamera(cameraChoice.value||undefined);
  if(epoch!==cameraEpoch){stopCamera(stream);return;}
  cameraStream=stream;
  cameraPreview.srcObject=stream;cameraPreview.hidden=false;
  await cameraPreview.play();
  if(epoch!==cameraEpoch)return;
  await refreshCameras();
  scannerStatus.textContent='Camera active. Point it at a QR code.';
  scanCameraFrame(epoch);
 }catch(err){
  if(epoch===cameraEpoch){clearCamera();scannerStatus.textContent=err instanceof Error?'Unable to start camera: '+err.message:'Unable to start camera.';}
 }finally{cameraStarting=false;if(!cameraStream)cameraStart.disabled=false;}
});
cameraStop.addEventListener('click',()=>{clearCamera();scannerStatus.textContent='Camera stopped.';});
window.addEventListener('pagehide',clearCamera);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cameraStream){clearCamera();scannerStatus.textContent='Camera stopped when the page was hidden.';}});
void refreshCameras();
const libraryTitle=document.querySelector<HTMLInputElement>('#library-title')!;
const librarySave=document.querySelector<HTMLButtonElement>('#library-save')!;
const libraryFilter=document.querySelector<HTMLSelectElement>('#library-filter')!;
const libraryList=document.querySelector<HTMLDivElement>('#library-list')!;
const librarySearch=document.querySelector<HTMLInputElement>('#library-search')!;
const librarySort=document.querySelector<HTMLSelectElement>('#library-sort')!;
const libraryCount=document.querySelector<HTMLParagraphElement>('#library-count')!;
const libraryNewCollection=document.querySelector<HTMLInputElement>('#library-new-collection')!;
const libraryCollectionFilter=document.querySelector<HTMLSelectElement>('#library-collection-filter')!;
const libraryDeleteCollection=document.querySelector<HTMLButtonElement>('#library-delete-collection')!;
const libraryClear=document.querySelector<HTMLButtonElement>('#library-clear')!;
const libraryStatus=document.querySelector<HTMLParagraphElement>('#library-status')!;
let savedQRs:SavedQR[]=[];
try{savedQRs=parseLibrary(localStorage.getItem(LIBRARY_KEY));}
catch{libraryStatus.textContent='Browser storage is unavailable. Saving may not work.';}
function persistLibrary(next:SavedQR[]):boolean{
 try{localStorage.setItem(LIBRARY_KEY,JSON.stringify(next));savedQRs=next;return true;}
 catch{libraryStatus.textContent='Unable to save: browser storage may be full or disabled.';return false;}
}
function renderLibrary(){
 const currentCollection=libraryCollectionFilter.value;
 const names=collectionNames(savedQRs);
 libraryCollectionFilter.replaceChildren(new Option('All collections',''),new Option('Unfiled','__unfiled__'));
 for(const name of names)libraryCollectionFilter.add(new Option(name,name));
 libraryCollectionFilter.value=currentCollection===''||currentCollection==='__unfiled__'||names.includes(currentCollection)?currentCollection:'';
 libraryDeleteCollection.disabled=!libraryCollectionFilter.value||libraryCollectionFilter.value==='__unfiled__';
 libraryList.replaceChildren();
 const shown=filterAndSortLibrary(savedQRs,librarySearch.value,libraryFilter.value==='favorites',librarySort.value as LibrarySort).filter(item=>!libraryCollectionFilter.value||(libraryCollectionFilter.value==='__unfiled__'?!item.collection:item.collection===libraryCollectionFilter.value));
 libraryCount.textContent='Showing '+shown.length+' of '+savedQRs.length+' saved QR codes.';
 if(!shown.length){const empty=document.createElement('p');empty.textContent='No saved QR codes in this view.';libraryList.append(empty);}
 for(const item of shown){
  const row=document.createElement('div');row.className='library-row';
  const title=document.createElement('strong');title.textContent=item.title;
  const meta=document.createElement('span');meta.textContent=item.kind+' · '+new Date(item.createdAt).toLocaleDateString();
  const load=document.createElement('button');load.type='button';load.textContent='Load';
  load.addEventListener('click',()=>{
   kind.dispatchEvent(new Event('format-reveal'));
   kind.value=item.kind;
   kind.dispatchEvent(new Event('change'));
   inputs.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-field]').forEach(el=>{
    const value=item.values[el.dataset.field!]??'';
    if(el instanceof HTMLInputElement&&el.type==='checkbox')el.checked=value==='true';
    else el.value=value;
   });
   color.value=item.design.foreground;background.value=item.design.background;margin.value=String(item.design.margin);
   moduleStyle.value=item.moduleStyle;preset.value='custom';logoData='';logoFile.value='';
   libraryTitle.value=item.title;libraryNewCollection.value=item.collection||'';libraryStatus.textContent='Loaded '+item.title+'.';
   document.querySelector<HTMLElement>('#qr-creator')?.scrollIntoView({behavior:'auto',block:'start'});
   void update();
  });
  const favorite=document.createElement('button');favorite.type='button';favorite.textContent=item.favorite?'★ Unfavorite':'☆ Favorite';
  favorite.setAttribute('aria-label',(item.favorite?'Remove favorite: ':'Add favorite: ')+item.title);
  favorite.addEventListener('click',()=>{if(persistLibrary(toggleFavorite(savedQRs,item.id)))renderLibrary();});
  const remove=document.createElement('button');remove.type='button';remove.textContent='Delete';
  remove.setAttribute('aria-label','Delete '+item.title);
  remove.addEventListener('click',()=>{if(window.confirm('Delete saved QR "'+item.title+'"?')&&persistLibrary(removeSaved(savedQRs,item.id)))renderLibrary();});
  const collectionSelect=document.createElement('select');collectionSelect.setAttribute('aria-label','Collection for '+item.title);
  collectionSelect.add(new Option('Unfiled',''));
  for(const name of names)collectionSelect.add(new Option(name,name));
  collectionSelect.value=item.collection||'';
  collectionSelect.addEventListener('change',()=>{if(persistLibrary(assignCollection(savedQRs,item.id,collectionSelect.value)))renderLibrary();});
  load.setAttribute('aria-label','Load '+item.title);
  row.append(title,meta,load,favorite,collectionSelect,remove);libraryList.append(row);
 }
 libraryClear.disabled=savedQRs.length===0;
}
librarySave.addEventListener('click',()=>{
 if(!latestPayload){libraryStatus.textContent='Create a valid QR code first.';return;}
 const title=libraryTitle.value.trim();
 if(!title){libraryStatus.textContent='Enter a name before saving.';libraryTitle.focus();return;}
 if(kind.value==='totp'){libraryStatus.textContent='TOTP secrets cannot be saved to the local library or JSON backups. Generate and use the QR directly.';return;}
 const entry:SavedQR={id:crypto.randomUUID(),title,kind:kind.value as QRKind,values:values(),
  design:design(),moduleStyle:moduleStyle.value as ModuleStyle,createdAt:new Date().toISOString(),favorite:false,
  collection:normalizeCollection(libraryNewCollection.value)||undefined};
 if(persistLibrary(addSaved(savedQRs,entry))){
  renderLibrary();libraryStatus.textContent='Saved locally. Up to '+MAX_SAVED+' entries are kept.';
 }
});
libraryFilter.addEventListener('change',renderLibrary);
libraryCollectionFilter.addEventListener('change',renderLibrary);
libraryDeleteCollection.addEventListener('click',()=>{
 const name=libraryCollectionFilter.value;
 if(!name||name==='__unfiled__')return;
 if(window.confirm('Delete collection "'+name+'"? Its QR codes will become unfiled, not deleted.')&&persistLibrary(removeCollection(savedQRs,name))){
  libraryCollectionFilter.value='';renderLibrary();libraryStatus.textContent='Collection deleted. QR codes preserved.';
 }
});
librarySearch.addEventListener('input',renderLibrary);
librarySort.addEventListener('change',renderLibrary);
libraryClear.addEventListener('click',()=>{
 if(!savedQRs.length)return;
 if(window.confirm('Permanently delete all saved QR codes from this browser?')&&persistLibrary([])){
  renderLibrary();libraryStatus.textContent='All saved QR codes deleted.';
 }
});
const libraryExport=document.querySelector<HTMLButtonElement>('#library-export')!;
const libraryImportFile=document.querySelector<HTMLInputElement>('#library-import-file')!;
const libraryImportMode=document.querySelector<HTMLSelectElement>('#library-import-mode')!;
const libraryImport=document.querySelector<HTMLButtonElement>('#library-import')!;
libraryExport.addEventListener('click',()=>{
 try{
  const backup=exportBackup(savedQRs);
  download(new Blob([backup],{type:'application/json'}),'jaqra-library-backup.json');
  libraryStatus.textContent='Backup exported. Keep the file private; it may contain sensitive QR content.';
 }catch(err){libraryStatus.textContent=err instanceof Error?err.message:'Export failed.';}
});
libraryImport.addEventListener('click',async()=>{
 const file=libraryImportFile.files?.[0];
 if(!file){libraryStatus.textContent='Choose a JSON backup file first.';return;}
 if(file.size>MAX_BACKUP_BYTES){libraryStatus.textContent='Backup exceeds the 1 MB limit.';return;}
 libraryImport.disabled=true;
 try{
  const incoming=importBackup(await file.text());
  const replace=libraryImportMode.value==='replace';
  const next=replace?incoming:mergeBackup(savedQRs,incoming);
  const action=replace?'REPLACE all existing saved codes':'MERGE saved codes (matching IDs will be overwritten)';
  if(!window.confirm(action+' with '+incoming.length+' imported entries? Backup files may contain private data.'))return;
  if(persistLibrary(next)){
   renderLibrary();libraryStatus.textContent='Imported '+incoming.length+' entries locally ('+next.length+' total).';
   libraryImportFile.value='';
  }
 }catch(err){libraryStatus.textContent=err instanceof Error?err.message:'Unable to import backup.';}
 finally{libraryImport.disabled=false;}
});
renderLibrary();
initFormatExplorer();
makeFields();
frameTemplate.dispatchEvent(new Event('change'));
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
