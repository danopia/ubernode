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

let {redeemInvite, resumeSession} = yield require('membership.js');
let UI = yield require('ui.js');

let version = 'uber/p1';
// let roles = ['web', 'screen', 'input', 'mesh'];
let roles = ['p2p'];

let isMaster = yield SYSCALL('persist/read', {key: 'is-master'});
if (isMaster) {
  roles.push('seed'); // advertise as a P2P seed
}

let membershipCard = yield SYSCALL('persist/read', {key: 'membership-card'});
if (membershipCard && membershipCard.clusterId) {
  var membership = yield resumeSession({
    nodeVersion: version,
    roles: roles,
  }, membershipCard);

} else {
  var membership = yield redeemInvite({
    // TODO
    inviteId: '3010e176-b20f-4630-9f77-9a904bbf2587',
    nodeVersion: version,
    roles: roles,
  });
}

yield membership.bindUberNet();

// var cluster = yield Cluster.construct(registration);
// var grid = yield P2P.seedGrid(cluster);

// UI.setStatus('Completed startup');
