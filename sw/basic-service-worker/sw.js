'use strict';
const CACHE_NAME = 'cache-v1';
const RUNTIME = 'runtime';
const CACHE_URLS = [
  'index.html',
  'index.js'
];

self.addEventListener('install', event => {
  console.log('on install');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(CACHE_URLS))
    .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('on activate');
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    })
    .then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  console.log('on fetch');
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(RUNTIME)
        .then(cache => {
          return fetch(event.request)
          .then(response => {
            return cache.put(event.request, response.clone())
            .then(() => {
              return response;
            })
          })
        })
      })
    );
  }
});