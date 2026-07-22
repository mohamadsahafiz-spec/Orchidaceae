const CACHE = 'orchidaceae-v0-4-1';
const APP_FILES = ['./', './index.html', './css/style.css', './css/cycle.css', './css/living-experience.css', './css/release-candidate.css', './js/app.js', './manifest.json', './assets/orchidaceae-mark.svg'];

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('orchidaceae-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => response).catch(() => caches.match('./index.html'))));
});
