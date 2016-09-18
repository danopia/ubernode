/*
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
*/

// preload some stuff
yield require(['models.js', 'net.js', 'p2p.js']);

var {Node, Cluster} = yield require('models.js');
var Net = yield require('net.js');
var P2P = yield require('p2p.js');
var UI = yield require('ui.js');

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
  UI.setStatus('Received registration');
  localStorage.clusterId = coords.cluster.clusterId;
  localStorage.nodeId = coords.nodeId;
  localStorage.secret = coords.secret;
  localStorage.inviteId = coords.inviteId;
  return coords;
}

spawnP(function* () {
  var registration;

  if (localStorage.nodeId) {
    UI.setStatus('Registering node');
    registration = yield Net.register({
      clusterId: localStorage.clusterId,
      nodeId: localStorage.nodeId,
      secret: localStorage.secret,
      nodeVersion: version,
      roles: roles,
    });

    if (registration.errorMessage == 'Node not found') {
      localStorage.clear();
      location.reload();
    }
    console.log('Rejoined cluster.');

  } else {
    UI.setStatus('Redeeming ticket');
    registration = yield Net.register({
      // TODO
      inviteId: '3010e176-b20f-4630-9f77-9a904bbf2587',
      nodeVersion: version,
      roles: roles,
    });

    console.log('Redeemed invite for cluster.');
    storeCoordinates(registration);
  }

  var cluster = yield Cluster.construct(registration);
  // var grid = yield P2P.seedGrid(cluster);

  UI.setStatus('Completed startup');
});
