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

const apiHost = 'https://vhihtfwmw3.execute-api.us-west-2.amazonaws.com/prod';
joinCluster = (opts) => {
  return fetch(apiHost + '/register', {
    method: 'POST',
    body: JSON.stringify(opts),
    headers: {
      'content-type': 'application/json',
      'x-api-key': '2ZE8JHg2MS1EyaZthBBZ93XGr8EK3ljt39UTTwm2',
    },
    mode: 'cors',
    cache: 'no-cache',
  }).then((response) => {
    return response.json();
  });
};


if (localStorage.nodeId) {
  joinCluster({
    clusterId: localStorage.clusterId,
    nodeId: localStorage.nodeId,
    secret: localStorage.secret,
    nodeVersion: 'uber/0',
  }).then((info) => {
    console.log('Rejoined cluster.', info);
  });

} else {
  joinCluster({
    inviteId: '3010e176-b20f-4630-9f77-9a904bbf2587',
    nodeVersion: 'uber/0',
  }).then((info) => {
    console.log('Joined cluster.', info);

    localStorage.clusterId = info.clusterId;
    localStorage.nodeId = info.nodeId;
    localStorage.secret = info.secret;
    localStorage.inviteId = info.inviteId;
  })
}
