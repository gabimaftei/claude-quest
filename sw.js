/* Claude Quest service worker: shows push notifications and opens the right screen on tap.
   No caching, so game updates are instant. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
const SCREENS = ['duel', 'live', 'cheer', 'pass', 'streak'];
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  const open = SCREENS.includes(d.tag) ? d.tag : '';
  e.waitUntil(self.registration.showNotification(String(d.title || 'Claude Quest'), {
    body: String(d.body || ''), tag: open || 'cq', renotify: true,
    icon: 'icon-192.png', badge: 'icon-192.png', data: { open },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const open = (e.notification.data && e.notification.data.open) || '';
  const url = new URL(open ? './?open=' + open : './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (list) => {
    for (const c of list) {
      if ('focus' in c) { await c.focus(); if (open) c.postMessage({ open }); return; }
    }
    return self.clients.openWindow(url);
  }));
});
