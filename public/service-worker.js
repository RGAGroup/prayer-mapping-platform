const CACHE_NAME = 'atalaia-v1';
const RUNTIME_CACHE = 'atalaia-runtime-v1';

// Arquivos essenciais para cache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') return;

  // Ignorar requisições para APIs externas (Supabase, Google Maps, etc)
  const url = new URL(event.request.url);
  if (
    url.origin.includes('supabase') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('gstatic') ||
    url.origin.includes('openai')
  ) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Se a resposta for válida, cache ela
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tenta buscar do cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Se não houver cache, retorna página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        });
    })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-prayers') {
    event.waitUntil(syncPrayers());
  }
});

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atividade espiritual!',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: 'atalaia-notification',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'Ver Agora' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Atalaia - Global Vision', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função auxiliar para sincronizar orações
async function syncPrayers() {
  try {
    console.log('[Service Worker] Syncing prayers...');
    // Aqui você pode adicionar lógica de sincronização
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

