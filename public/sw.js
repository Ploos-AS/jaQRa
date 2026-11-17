/* BUILD_PRECACHE */
const CACHE='jaqra-precache-'+PRECACHE_VERSION;
const PRECACHE_PATHS=new Set(PRECACHE_URLS);

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE_URLS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('jaqra-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(async()=>{
   const cache=await caches.open(CACHE);
   return (await cache.match('/index.html'))||Response.error();
  }));
  return;
 }
 if(PRECACHE_PATHS.has(url.pathname)){
  event.respondWith(caches.open(CACHE).then(async cache=>{
   const cached=await cache.match(url.pathname);
   return cached||fetch(request);
  }));
 }
});
