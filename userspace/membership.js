var {Cluster, Node} = yield require('models.js');
var Net = yield require('net.js');
var P2P = yield require('p2p.js');
var UI = yield require('ui.js');

exports.ClusterMembership = class ClusterMembership {
  constructor(registration, {nodeId, secret}) {
    // TODO
    window.MEMBERSHIP = this;
    
    this.registration = registration;
    this.clusterId = registration.cluster.clusterId;
    this.nodeId = nodeId;
    this.secret = secret;

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

    this.uberNetPromise = pusherSetup.then(pusher => {
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
    return this.uberNetPromise;
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
};

exports.redeemInvite = (metadata) => {
  UI.setStatus('Redeeming ticket');

  return Net.register(metadata).then(registration => {
    UI.setStatus('Received registration');

    return SYSCALL('persist/write', {
      key: 'membership-card',
      value: {
        clusterId: registration.cluster.clusterId,
        inviteId: registration.inviteId,
        nodeId: registration.nodeId,
        secret: registration.secret,
      },
    }).then(() => {
      return new exports.ClusterMembership(registration, registration);
    });
  });
};

exports.resumeSession = (metadata, membershipCard) => {
  UI.setStatus('Validating cluster membership');
  metadata.clusterId = membershipCard.clusterId;
  metadata.nodeId = membershipCard.nodeId;
  metadata.secret = membershipCard.secret;

  return Net.register(metadata).then(registration => {
    UI.setStatus('Received registration renewal');
    return new exports.ClusterMembership(registration, membershipCard);
  }).catch(err => {
    if (err.message == 'Node not found') {
      return SYSCALL('persist/write', {
        key: 'membership-card',
        value: false,
      }).then(() => {
        location.reload();
        throw new Error("Node renewal rejected by ubernet");
      });
    }
    throw err;
  });
};
