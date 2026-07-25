/**
 * service-worker.js
 * -----------------------------------------------------------------------
 * Provides offline support for Wise Family Living Road Trip Explorer.
 *
 * Strategy:
 *  - App shell (index.html, css/, js/, manifest.json, icons/) is
 *    pre-cached on install and served cache-first, so the entire app
 *    works offline after the first successful visit.
 *  - Data itself (trips, stops, journal entries, photos) is NOT handled
 *    here at all — it lives in localStorage via js/storage.js, which
 *    works offline natively with zero network involvement.
 *  - External CDN assets (Tailwind, Google Fonts) use a
 *    stale-while-revalidate strategy: serve the cached copy instantly
 *    if we have one, and quietly refresh the cache in the background
 *    when online. This means the app keeps working offline even for
 *    these external dependencies once they've been loaded at least once.
 *
 * Bump CACHE_VERSION whenever app shell files change so returning users
 * get the update instead of a stale cached copy.
 * -----------------------------------------------------------------------
 */

var CACHE_VERSION = 'wfl-rte-v1';
var APP_SHELL_CACHE = CACHE_VERSION + '-shell';
var RUNTIME_CACHE = CACHE_VERSION + '-runtime';

var APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/storage.js',
  '/js/utilities.js',
  '/js/budget.js',
  '/js/journal.js',
  '/js/campground.js',
  '/js/learn.js',
  '/js/local.js',
  '/js/checklist.js',
  '/js/maps.js',
  '/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key.indexOf(CACHE_VERSION) !== 0; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isAppShellRequest(url) {
  return APP_SHELL_FILES.some(function (path) {
    return url.pathname === path || (path === '/' && url.pathname === '/');
  });
}

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var networkFetch = fetch(request).then(function (response) {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function () {
        return cached; // offline and nothing new to serve — fall back to cache
      });
      return cached || networkFetch;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return; // never intercept POST/PUT/etc.

  var url = new URL(request.url);

  // App shell: cache-first (instant offline load of the app itself)
  if (url.origin === self.location.origin && isAppShellRequest(url)) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        return cached || fetch(request);
      })
    );
    return;
  }

  // Navigations (e.g. deep link / refresh) always fall back to the cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Everything else (Tailwind CDN, Google Fonts, etc.): stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});
