// El Teacher IA — Service Worker
// CP9: Permite instalación como PWA y uso parcial offline

const CACHE = 'teacher-ia-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Instalar: cachear archivos de la app
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para API, cache-first para la app
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Llamadas a Gemini siempre van a la red (necesitan internet)
  if (url.includes('generativelanguage.googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Para los archivos de la app: red primero, cache como respaldo
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Guardar en cache si es exitoso
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
