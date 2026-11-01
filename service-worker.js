// Nom et version du cache (changez la version 'v1' en 'v2', etc., si vous mettez à jour votre site)
const CACHE_NAME = 'mon-app-v1';

// Liste des fichiers de base à mettre en cache dès l'installation
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// 1. INSTALLATION : On télécharge et met en cache les fichiers essentiels
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers de base');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force le nouveau Service Worker à s'activer immédiatement sans attendre
  self.skipWaiting();
});

// 2. ACTIVATION : On nettoie les anciens caches pour éviter de garder des fichiers obsolètes
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prend le contrôle de toutes les pages ouvertes immédiatement
  self.clients.claim();
});

// 3. FETCH (INTERCEPTION) : Stratégie "Cache First" avec repli sur le réseau
self.addEventListener('fetch', (event) => {
  // On ignore les requêtes non-GET (par exemple les extensions Chrome, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si le fichier est présent dans le cache, on le renvoie directement
      if (cachedResponse) {
        return cachedResponse;
      }

      // Sinon, on va le chercher sur le réseau internet
      return fetch(event.request)
        .then((networkResponse) => {
          // Optionnel : Vous pouvez aussi mettre en cache dynamiquement 
          // les nouvelles pages visitées au fur et à mesure si besoin.
          return networkResponse;
        })
        .catch(() => {
          // Si le réseau échoue (ex: hors-ligne) et que le fichier n'est pas dans le cache,
          // vous pouvez retourner une page de secours personnalisée si vous le souhaitez.
          console.log('[Service Worker] Échec de la requête réseau (hors-ligne).');
        });
    })
  );
});