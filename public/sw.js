self.addEventListener('install', () => {
  // The service worker will be installed and then immediately activate.
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Once activated, unregister this service worker to clean up any old caches or workers.
  // This is useful if a previous project on this port registered a service worker.
  self.registration.unregister().then(() => {
    console.log('Service Worker unregistered');
  });
});
