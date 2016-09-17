var UI = self.exports = {
  target: document.body.querySelector('#render-target'),
  status: 'Waiting for first script',

  setStatus(status) {
    console.log('New status:', status);
    this.status = status;
    this.render();
  },

  render() {
    var children = [];
    console.log('Rendering');

    children.push('<img src="/blob/geometric.gif" id="loading-icon">');
    children.push('<h1>', this.status, '...', '</h1>');

    if (window.LocalCluster) {
      children.push('<h3>', LocalCluster.name, '</h3>');
      children.push('<p>Associated P2P nodes:</p>')
      children.push('<ul>');
      LocalCluster.eachNode((node) => {
        if (node.hasRole('p2p')) {
          children.push('<li>', node.id, ' - ');
          children.push(node.metadata.roles.join(', '))

          if (node.channel) {
            children.push(' - <strong>CONNECTED!</strong>');
          } else if (node.isSelf()) {
            children.push(' - Local node');
          } else {
            children.push(' - Disconnected');
            children.push(' - Last seen: ', node.metadata.lastSeen);
          }

          children.push('</li>');
        }
      });
      children.push('</ul>');
    } else {
      children.push('<h3>Waiting for cluster...</h3>');
    }

    this.target.innerHTML = children.join('');
  },
};

UI.render();
