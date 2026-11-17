import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

const script=resolve('scripts/precache.mjs');
const worker=resolve('public/sw.js');
async function fixture(){
 const dir=await mkdtemp(join(tmpdir(),'jaqra-precache-'));
 await mkdir(join(dir,'dist','assets'),{recursive:true});
 await mkdir(join(dir,'public'));
 await copyFile(worker,join(dir,'public','sw.js'));
 await writeFile(join(dir,'dist','index.html'),'<html>v1</html>');
 await writeFile(join(dir,'dist','manifest.webmanifest'),'{}');
 await writeFile(join(dir,'dist','icon.svg'),'<svg/>');
 await writeFile(join(dir,'dist','assets','app.123.js'),'console.log(1)');
 await writeFile(join(dir,'dist','assets','app.123.css'),'body{}');
 return dir;
}
function build(dir){execFileSync(process.execPath,[script],{cwd:dir,stdio:'pipe'});}
function version(source){const match=source.match(/const PRECACHE_VERSION="([a-f0-9]+)"/);assert.ok(match);return match[1];}
test('generates precache with JS, CSS and shell files',async()=>{
 const dir=await fixture();try{
  build(dir);
  const sw=await readFile(join(dir,'dist','sw.js'),'utf8');
  assert.ok(sw.includes('/assets/app.123.js'));
  assert.ok(sw.includes('/assets/app.123.css'));
  assert.ok(sw.includes('/index.html'));
  assert.doesNotMatch(sw,/BUILD_PRECACHE/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('changes cache version when bytes change but filenames stay constant',async()=>{
 const dir=await fixture();try{
  build(dir);const before=version(await readFile(join(dir,'dist','sw.js'),'utf8'));
  await writeFile(join(dir,'dist','index.html'),'<html>v2</html>');
  build(dir);const after=version(await readFile(join(dir,'dist','sw.js'),'utf8'));
  assert.notEqual(after,before);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('fails the build when the JS bundle is missing',async()=>{
 const dir=await fixture();try{
  await rm(join(dir,'dist','assets','app.123.js'));
  assert.throws(()=>build(dir));
 }finally{await rm(dir,{recursive:true,force:true});}
});
