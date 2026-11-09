/* Çevrimdışı kullanım: ağ öncelikli, önbellek yedekli. */
const CACHE='nurullah100-pwa-v6';
const CORE=['./','./index.html','./styles.css?v=3','./gothic.css?v=5','./gothic-scene.svg','./curriculum.js?v=1','./plan.js?v=2','./resources.js?v=1','./app.js?v=6','./subtopics-data.js?v=1','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}));});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}) )}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(function(r){
    if(r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){return c.put(e.request,copy)});}
    return r;
  }).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match('./index.html')})}));
});