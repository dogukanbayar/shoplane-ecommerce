const CACHE_PREFIX = 'myshop';
const CACHE_VERSION = 'v1.0.0';
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${CACHE_VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-${CACHE_VERSION}`;

// Statik assets'ler (install sırasında cache'lenir)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/favicon.ico',
  '/icons/',
];

/**
 * Service Worker Install Event
 * Statik assets'leri önceden cache'leyerek offline desteği sağlar
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        
        // Kritik CSS ve JS dosyaları cache'le
        const criticalAssets = [
          '/',
          '/index.html',
        ];
        
        await Promise.allSettled(
          criticalAssets.map((asset) =>
            fetch(asset)
              .then((response) => {
                if (response.ok) {
                  return cache.put(asset, response);
                }
              })
              .catch(() => console.warn(`[SW] Could not cache ${asset}`))
          )
        );
        
        // Service Worker'ı skip waiting ile hemen aktif et
        await self.skipWaiting();
        console.log('[SW] Installation complete');
      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activate Event
 * Eski cache'leri siler ve yeni versiyona geçişi halleder
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Tüm cache isimleri al
        const cacheNames = await caches.keys();
        
        // Eski cache'leri sil
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
        
        // Yeni service worker'a hemen geç (clients.claim)
        await self.clients.claim();
        console.log('[SW] Activation complete');
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Fetch Event
 * Caching stratejilerini uygular:
 * - API: Network-first (ama cache fallback vardır)
 * - İmajlar: Cache-first (cache yoksa network'ten al)
 * - CSS/JS: Stale-while-revalidate (cache kullan, arka planda update et)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Same-origin istekleri kontrol et
  if (url.origin !== location.origin) {
    return;
  }
  
  // API istekleri: Network First (ama cache fallback vardır)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }
  
  // İmajlar: Cache First
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }
  
  // CSS, JS, Fontlar: Stale-While-Revalidate
  if (isCacheableAsset(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
    return;
  }
  
  // Diğer istekler: Network-first
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

/**
 * Network-First Strategy
 * Önce network'ten al, başarısız olursa cache'den al
 * API çağrıları ve dinamik içerik için ideal
 */
async function networkFirstStrategy(request, cacheName) {
  // POST istekleri cache'leme - sadece GET
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      if (request.mode === 'navigate') {
        return getOfflineResponse();
      }
      return new Response('Offline - İçerik kullanılamıyor', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
  
  try {
    // Network'ten al
    const response = await fetch(request);
    
    // Başarılı response'ı cache'le (clone hemen, body kullanılmadan)
    if (response.ok && response.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        // Cache gets the clone, we return the original
        cache.put(request, response.clone()).catch((err) => {
          console.warn('[SW] Failed to cache response:', err.message);
        });
      } catch (err) {
        console.warn('[SW] Failed to cache response:', err.message);
      }
    }
    
    return response;
  } catch (error) {
    // Network başarısız, cache'den al
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Network failed, serving from cache:', request.url);
      return cached;
    }
    
    // Cache yoksa offline page göster
    if (request.mode === 'navigate') {
      return getOfflineResponse();
    }
    
    // Dönemediğimiz şey için error response
    return new Response('Offline - İçerik kullanılamıyor', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Cache-First Strategy
 * Önce cache'de ara, yoksa network'ten al
 * İmajlar ve statik assets için ideal (sık değişmeyen)
 */
async function cacheFirstStrategy(request, cacheName) {
  // Cache'de ara
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    // Network'ten al
    const response = await fetch(request);
    
    // Başarılı response'ı cache'le (sadece GET ve 200 status)
    if (response && response.status === 200 && request.method === 'GET') {
      try {
        const cache = await caches.open(cacheName);
        // Cache gets the clone, we return the original
        cache.put(request, response.clone()).catch((err) => {
          console.warn('[SW] Failed to cache response:', err.message);
        });
      } catch (err) {
        console.warn('[SW] Failed to cache response:', err.message);
      }
    }
    
    return response;
  } catch (error) {
    // Network başarısız, offline response dön
    console.warn('[SW] Cache and network both failed:', request.url);
    
    // İmaj requestleri için placeholder
    if (isImageRequest(request)) {
      return getOfflineImageResponse();
    }
    
    return new Response('Offline - İçerik kullanılamıyor', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale-While-Revalidate Strategy
 * Cache'den hemen dönerek, arka planda network'ten update et
 * En iyi UX için CSS, JS dosyaları idealdir
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  // POST istekleri network-first olarak işle
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      const cached = await caches.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  }
  
  const cached = await caches.match(request);
  
  // Update cache in background
  const updateCache = async () => {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        try {
          const cache = await caches.open(cacheName);
          // Clone once and cache it
          await cache.put(request, response.clone());
        } catch (err) {
          console.warn('[SW] Failed to cache response:', err.message);
        }
      }
    } catch (error) {
      console.warn('[SW] Background update failed:', error.message);
    }
  };
  
  // Start background update but don't wait for it
  updateCache();
  
  // Return cached immediately if available, otherwise fetch and return
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    // Also cache this fresh response
    if (response && response.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        // Don't wait for cache.put, return immediately
        cache.put(request, response.clone()).catch(err => {
          console.warn('[SW] Failed to cache response:', err.message);
        });
      } catch (err) {
        console.warn('[SW] Failed to cache response:', err.message);
      }
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Offline Response
 * Kullanıcı offline olduğunda gösterilecek responsive HTML
 */
function getOfflineResponse() {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - MyShop</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 20px;
          max-width: 500px;
        }
        h1 { font-size: 2.5em; margin-bottom: 0.5em; }
        p { font-size: 1.1em; line-height: 1.6; margin-bottom: 2em; opacity: 0.9; }
        .icon {
          font-size: 4em;
          margin-bottom: 0.5em;
        }
        button {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 30px;
          font-size: 1em;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>Bağlantı Kesildi</h1>
        <p>İnternet bağlantınız kesik. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.</p>
        <p>Daha önce ziyaret ettiğiniz sayfaları offline modda görebilirsiniz.</p>
        <button onclick="location.reload()">Tekrar Dene</button>
      </div>
    </body>
    </html>
    `,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

/**
 * Offline Image Response
 * Resim yüklenemediğinde gri placeholder göster
 */
function getOfflineImageResponse() {
  // 1x1 gri PNG pixel
  const grayPixel = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
    0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0xa8, 0xa8, 0xa8, 0x00, 0x00, 0x00,
    0x03, 0x00, 0x01, 0x42, 0xa5, 0xfd, 0x4f, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  
  return new Response(new Blob([grayPixel], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
}

/**
 * İstek türünü kontrol eden yardımcı fonksiyonlar
 */

function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isCacheableAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return (
    /\.(js|css|woff|woff2|ttf|eot)$/i.test(pathname) ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  );
}

/**
 * Background Sync (Opsiyonel)
 * Form gönderimleri offline sırada ayarlanabilir
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartData());
  }
});

async function syncPendingOrders() {
  try {
    // Ileride uygulanacak: IndexedDB'den beklemede olan siparişleri al ve gönder
    console.log('[SW] Syncing pending orders...');
  } catch (error) {
    console.error('[SW] Order sync failed:', error);
  }
}

async function syncCartData() {
  try {
    // Ileride uygulanacak: Sepet verisini sunucuyu ile senkronize et
    console.log('[SW] Syncing cart data...');
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
  }
}

/**
 * Push Notifications (Opsiyonel)
 * Firebase Cloud Messaging ile bildirim gönderme
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'MyShop bildirimini açmak için tıklayın',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'myshop-notification',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MyShop', options)
    );
  } catch (error) {
    console.error('[SW] Push notification failed:', error);
  }
});

/**
 * Notification Click Handler
 * Bildirime tıklanınca URL'ye yönlendir
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Zaten açık bir pencere varsa oraya yönlendir
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Yoksa yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service Worker script loaded');
