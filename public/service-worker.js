/* eslint-disable no-restricted-globals */


const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/mynfts.png',
  '/nftsale.png',
  '/nftauction.png',
  // Diğer önbelleğe alınacak kaynaklar
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
