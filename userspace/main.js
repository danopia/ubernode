if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

if ('serviceWorker' in navigator) {
 console.log('Service Worker is supported');
 navigator.serviceWorker.register('sw.js').then(function(reg) {
   console.log(':^)', reg);
   // TODO
 }).catch(function(err) {
   console.log(':^(', err);
 });
}

let version = 'uber/p1';
// let roles = ['web', 'screen', 'input', 'mesh'];
let roles = ['p2p'];

if (localStorage.isMaster) {
  roles.push('seed'); // advertise as a P2P seed
}

function log(message) {
  return function (item) {
    console.log(message, item);
    return item;
  };
}

function storeCoordinates(coords) {
  localStorage.clusterId = coords.cluster.clusterId;
  localStorage.nodeId = coords.nodeId;
  localStorage.secret = coords.secret;
  localStorage.inviteId = coords.inviteId;
  return coords;
}

var registration;
if (localStorage.nodeId) {
  registration = UberNet.register({
    clusterId: localStorage.clusterId,
    nodeId: localStorage.nodeId,
    secret: localStorage.secret,
    nodeVersion: version,
    roles: roles,
  }).then((obj) => {
    if (obj.errorMessage == 'Node not found') {
      localStorage.clear();
      location.reload();
    }
    return obj;
  }).then(log('Rejoined cluster.'));

} else {
  registration = UberNet.register({
    // TODO
    inviteId: '3010e176-b20f-4630-9f77-9a904bbf2587',
    nodeVersion: version,
    roles: roles,
  }).then(log('Redeemed invite for cluster.'))
    .then(storeCoordinates);
}

registration
  .then(Cluster.construct)
  .then(seedGrid);
