window.Clusters = {};
window.LocalCluster = null;
window.LocalNode = null;

// var UI = yield require('ui.js');

class Node {
  constructor(metadata) {
    // lastSeen, nodeId, roles, runningVersion
    this.metadata = metadata;

    this.id = metadata.nodeId;
    this.clusterId = metadata.clusterId;

    if (this.isSelf()) {
      LocalNode = this;
    }
  }

  isSelf() {
    return this.id == MEMBERSHIP.nodeId;
  }

  isInCluster() {
    return this.clusterId == MEMBERSHIP.clusterId;
  }

  cluster() {
    return Clusters[this.clusterId];
  }

  hasRole(role) {
    return this.metadata.roles.includes(role);
  }

  send(data) {
    if (this.channel) {
      this.channel.send(JSON.stringify(data));
    } else {
      console.log("Can't talk to", this, "- no channel");
    }
  }
}

class Cluster {
  constructor(metadata) {
    // apps, clusterId, friendlyName, owner, slug, visibility
    this.metadata = metadata;

    this.id = metadata.clusterId;
    this.name = metadata.friendlyName;
    this.nodes = {};

    Clusters[this.id] = this;
    if (this.isSelf()) {
      LocalCluster = this;
      // UI.setStatus('Reconstructed neighbor listing');
    }
  }

  isSelf() {
    return this.id == MEMBERSHIP.clusterId;
  }

  addNode(node) {
    this.nodes[node.id] = node;
  }

  eachNode(cb) {
    Object.keys(this.nodes)
      .map((key) => {
        return this.nodes[key];
      }).forEach(cb);
  }

  searchForRole(role) {
    return Object.keys(this.nodes)
      .map((key) => {
        return this.nodes[key];
      })
      .filter((node) => {
        return node.hasRole(role);
      });
  }
}

exports.Node = Node;
exports.Cluster = Cluster;


var {DocumentStore} = yield require('data/document-store.js');

window.ClusterStore = new DocumentStore({
  tableName: 'ClusterStore',
  inflater: Cluster,

  hashKey: 'clusterId',
  hashKeyType: String,
});

window.NodeStore = new DocumentStore({
  tableName: 'NodeStore',
  inflater: Node,

  hashKey: 'clusterId',
  hashKeyType: String,
  sortKey: 'nodeId',
  sortKeyType: String,
});

/*
Cluster.construct = (payload) => {
  var cluster = new Cluster(payload.cluster);
  payload.nodes.forEach((node) => {
    cluster.addNode(new Node(node, payload.cluster.clusterId));
  });
  UI.render();
  return cluster;
};
*/
