var {Cluster, Node} = yield require('models.js');
var Net = yield require('net.js');
var P2P = yield require('p2p.js');
var UI = yield require('ui.js');

exports.ClusterMembership = class ClusterMembership {
  constructor(registration) {
    this.registration = registration;
    this.clusterId = registration.cluster.clusterId;
    this.nodeId = localStorage.nodeId;

    ClusterStore.putItem(registration.cluster);
    for (let node of registration.nodes) {
      node.clusterId = this.clusterId;
      NodeStore.putItem(node);
    }

    UI.setStatus('Constructed Cluster Membership');
  }

  bindUberNet() {
    // cache the channel
    if (this.uberNetPromise) return this.uberNetPromise;
    let pusherSetup = require('pusher-setup.js');

    return this.uberNetPromise = pusherSetup.then(pusher => {
      var channel = pusher.subscribe('cluster_' + this.clusterId);

      channel.bind('membership-log', evt => {
        this.processMembershipChange(evt);
      });

      return new Promise((resolve, reject) => {
        channel.bind('pusher:subscription_succeeded', resolve);
      }).then(evt => {
        UI.setStatus('Subscribed to Pusher channel');
        return channel;
      });
    });
  }

  processMembershipChange(evt) {
    if (evt.action === 'joined') {
      delete evt.action;
      console.log('Stored new node', evt.nodeId, 'in store');
      NodeStore.putItem(evt);

    } else {
      console.log('Received unknown membership event', evt.action);
    }
  }
}

exports.redeemInvite = (metadata) => {
  UI.setStatus('Redeeming ticket');

  return Net.register(metadata).then(registration => {
    UI.setStatus('Received registration');

    localStorage.clusterId = registration.cluster.clusterId;
    localStorage.nodeId = registration.nodeId;
    localStorage.secret = registration.secret;
    localStorage.inviteId = registration.inviteId;

    return new exports.ClusterMembership(registration);
  });
};

exports.resumeSession = (metadata) => {
  UI.setStatus('Validating cluster membership');
  metadata.clusterId = localStorage.clusterId;
  metadata.nodeId = localStorage.nodeId;
  metadata.secret = localStorage.secret;

  return Net.register(metadata).then(registration => {
    UI.setStatus('Received registration renewal');

    if (registration.errorMessage == 'Node not found') {
      localStorage.clear();
      location.reload();
      throw new Error("Node renewal rejected by ubernet");
    }

    return new exports.ClusterMembership(registration);
  });
};
