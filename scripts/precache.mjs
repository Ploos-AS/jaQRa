import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';

const dist='dist';
const files=[];
async function walk(dir){
 for(const item of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,item.name);
  if(item.isDirectory())await walk(path);
  else if(item.isFile()&&item.name!=='sw.js')files.push('/'+relative(dist,path).split(sep).join('/'));
 }
}
await walk(dist);
files.sort();
const required=['/index.html','/manifest.webmanifest','/icon.svg'];
for(const path of required)if(!files.includes(path))throw new Error('Missing required offline asset: '+path);
if(!files.some(path=>/^\/assets\/.*\.js$/.test(path)))throw new Error('No Vite JS bundle found for offline precache.');
const version=createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0,16);
const source=await readFile('public/sw.js','utf8');
const marker='/* BUILD_PRECACHE */';
if(!source.includes(marker))throw new Error('Service worker precache marker is missing.');
const output=source.replace(marker,`const PRECACHE_VERSION=${JSON.stringify(version)};\nconst PRECACHE_URLS=${JSON.stringify(files)};`);
await writeFile(join(dist,'sw.js'),output);
console.log('Generated offline precache for '+files.length+' files ('+version+').');
