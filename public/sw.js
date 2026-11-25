self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {
    title: 'HomeBase',
    body: 'Bạn có nhắc nhở mới.',
    url: '/app/maintenance',
    tag: 'homebase-reminder',
  };

  try {
    const parsed = event.data.json();
    payload = { ...payload, ...parsed };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon',
      badge: '/apple-icon',
      tag: payload.tag,
      renotify: true,
      data: { url: payload.url || '/app/maintenance' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/app/maintenance';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
