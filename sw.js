/**
 * Balancify Service Worker
 * Enhanced PWA capabilities with offline functionality
 */

const CACHE_NAME = 'balancify-v2.0';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Cached all files successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Caching failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).then((response) => {
                    // Don't cache if not a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // If both cache and network fail, return offline page
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Handle background sync (for future implementation)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    if (event.tag === 'balancify-data-sync') {
        event.waitUntil(syncData());
    }
});

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    let notificationData = {
        title: 'Balancify',
        body: 'Don't forget to log your expenses!',
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        data: {
            url: './'
        }
    };

    if (event.data) {
        try {
            notificationData = { ...notificationData, ...event.data.json() };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.matchAll().then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

// Sync data function (placeholder for future implementation)
async function syncData() {
    try {
        console.log('Service Worker: Syncing data...');
        // Future implementation for cloud sync
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Sync failed:', error);
        throw error;
    }
}

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('Service Worker: Script loaded');