window.Clusters = {};
window.LocalCluster = null;
window.LocalNode = null;

class Node {
  constructor(metadata, clusterId) {
    // lastSeen, nodeId, roles, runningVersion
    this.metadata = metadata;

    this.id = metadata.nodeId;
    this.clusterId = clusterId || metadata.clusterId;

    if (this.isSelf()) {
      LocalNode = this;
    }
  }

  isSelf() {
    return this.id == localStorage.nodeId;
  }

  isInCluster() {
    return this.clusterId == localStorage.clusterId;
  }

  cluster() {
    return Clusters[this.clusterId];
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
    }
  }

  isSelf() {
    return this.id == localStorage.clusterId;
  }

  addNode(node) {
    this.nodes[node.id] = node;
  }
}

Cluster.construct = (payload) => {
  var cluster = new Cluster(payload.cluster);
  payload.nodes.forEach((node) => {
    cluster.addNode(new Node(node, payload.cluster.clusterId));
  });
  return cluster;
};
