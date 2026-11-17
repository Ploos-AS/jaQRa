import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const dist='dist';
const html=await readFile(join(dist,'index.html'),'utf8');
const worker=await readFile(join(dist,'sw.js'),'utf8');
const manifest=JSON.parse(await readFile(join(dist,'manifest.webmanifest'),'utf8'));
function assert(condition,message){if(!condition)throw new Error('PWA smoke check: '+message);}
assert(html.includes('rel="manifest"'),'HTML must reference PWA manifest');
assert(manifest.start_url==='/'&&manifest.scope==='/'&&manifest.display==='standalone','PWA manifest must be installable at root');
assert(!worker.includes('/* BUILD_PRECACHE */'),'service worker build marker must be replaced');
const match=worker.match(/const PRECACHE_VERSION=("[a-f0-9]{16}");\s*const PRECACHE_URLS=(\[[^;]*\]);/);
assert(match,'service worker must contain generated precache version and manifest');
const files=JSON.parse(match[2]);
assert(Array.isArray(files)&&files.length>0,'precache must not be empty');
assert(new Set(files).size===files.length,'precache must not contain duplicate paths');
for(const required of ['/index.html','/manifest.webmanifest','/icon.svg'])assert(files.includes(required),'missing '+required);
assert(files.some(x=>/^\/assets\/[^/]+\.js$/.test(x)),'missing Vite JavaScript bundle');
assert(files.some(x=>/^\/assets\/[^/]+\.css$/.test(x)),'missing Vite CSS bundle');
const fingerprint=createHash('sha256');
for(const url of files){
 assert(/^\/[a-zA-Z0-9_./-]+$/.test(url)&&!url.includes('..')&&!url.includes('//'),'unsafe precache path '+url);
 const path=join(dist,url.slice(1));
 const info=await stat(path);
 assert(info.isFile(),'precache entry is not a file: '+url);
 const bytes=await readFile(path);
 fingerprint.update(url+'\\0');
 fingerprint.update(String(bytes.length)+'\\0');
 fingerprint.update(bytes);
}
assert(fingerprint.digest('hex').slice(0,16)===JSON.parse(match[1]),'precache version must match actual file contents');
for(const asset of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g))assert(files.includes(asset[1]),'HTML asset is not precached: '+asset[1]);
console.log('PWA build smoke checks passed ('+files.length+' precached files).');
