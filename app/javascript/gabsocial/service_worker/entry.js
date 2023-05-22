// import { freeStorage, storageFreeable } from '../storage/modifier';
import './web_push_notifications';

// function openSystemCache() {
//   return caches.open('gabsocial-system');
// }

function openWebCache() {
  return caches.open('gabsocial-web');
}

function fetchRoot() {
  return fetch('/', { credentials: 'include', redirect: 'manual' });
}

// const firefox = navigator.userAgent.match(/Firefox\/(\d+)/);
// const invalidOnlyIfCached = firefox && firefox[1] < 60;

// Cause a new version of a registered Service Worker to replace an existing one
// that is already installed, and replace the currently active worker on open pages.
self.addEventListener('install', function(event) {
  event.waitUntil(Promise.all([openWebCache(), fetchRoot()]).then(([cache, root]) => cache.put('/', root)));
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  if (url.pathname === '/auth/sign_out') {
    const asyncResponse = fetch(event.request);
    const asyncCache = openWebCache();

    event.respondWith(asyncResponse.then(response => {
      if (response.ok || response.type === 'opaqueredirect') {
        return Promise.all([
          asyncCache.then(cache => cache.delete('/')),
          indexedDB.deleteDatabase('gabsocial'),
        ]).then(() => response);
      }

      return response;
    }));
  } 
});