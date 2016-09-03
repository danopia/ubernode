console.log('Started', self);

self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
  console.log('Activated', event);
  // var request = self.indexedDB.open("MyTestDatabase", 3);
});

self.addEventListener('push', function(event) {
  console.log('Push message received', event);
  // TODO
});
