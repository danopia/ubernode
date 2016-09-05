window.UberUI = {
  target: document.body.querySelector('#render-target'),

  render() {
    var children = [];
    console.log('Rendering', LocalCluster);

    if (LocalCluster) {
      children.push('<h1>', LocalCluster.name, '</h1>');
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
      children.push('<h3>Connecting...</h3>');
    }

    this.target.innerHTML = children.join('');
  }
};

UberUI.render();
