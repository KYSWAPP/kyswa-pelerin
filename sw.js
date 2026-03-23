// v3 — cache busted
const CACHE_VERSION = 'kyswa-v3';

self.addEventListener('install', e => {
  // Force immediate activation
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches so fresh files are loaded from server
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Never cache — always fetch from network (fixes stale CSS/JS)
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => new Response('offline')));
});

// Notification scheduling via postMessage
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_NOTIF'){
    const {title, body, tag, delay} = e.data;
    const show = () => self.registration.showNotification(title, {
      body, icon:'/IMG_2081.png', tag, badge:'/IMG_2081.png'
    });
    if(delay > 0) setTimeout(show, delay);
    else show();
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
