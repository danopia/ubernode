var UI = yield require('ui.js');
var Net = yield require('net.js');
var pusherSetup = yield require('pusher-setup.js');

exports.seedGrid = (cluster) => {
  // var channelId = 'cluster_' + cluster.id;

  // Initialise DataChannel.js
  var datachannel = new DataChannel();
  datachannel.userid = window.LocalNode.id;
  datachannel.cluster = cluster;

  pusherSetup.then((pusher) => {
    // Set custom Pusher signalling channel
    // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
    datachannel.openSignalingChannel = function(config) {
      var xhrErrorCount = 0;
      var channel = config.channel || this.channel;

      // Subscribe to Pusher signalling channel
      var pusherChannel = pusher.subscribe(channel);
      console.log('Subscribed to', channel, 'on pusher')

      var socket = {
        channel: channel,
        send: function(message) {
          Net.beacon({
            target: channel,
            socketId: pusher.connection.socket_id,
            nodeId: localStorage.nodeId,
            secret: localStorage.secret,
            message: message,
          }).then((data) => {
            xhrErrorCount = 0;
          }).catch((err) => {
            if (++xhrErrorCount > 5) {
              console.log("Disabling signaller due to connection failure");
              datachannel.transmitRoomOnce = true;
            }
          });
        },
      };

      // Call callback on successful connection to Pusher signalling channel
      pusherChannel.bind("pusher:subscription_succeeded", function() {
        if (config.callback) config.callback(socket);
        if (config.onopen) config.onopen();
      });

      // Proxy Pusher signaller messages to DataChannel
      pusherChannel.bind("message", function(message) {
        config.onmessage(message);
      });

      return socket;
    };

    var seed;
    if (LocalNode.hasRole('seed')) {
      datachannel.open('seed_' + LocalNode.id);
      seed = LocalNode;
    } else {
      // Connect to most-recently-seen seed
      seed = LocalCluster.searchForRole('seed')
          .sort((a,b) => b.metadata.lastSeen - a.metadata.lastSeen)[0];

      if (!seed) {
        // No seed yet, reload as one
        // TODO: reloading is janky
        localStorage.isMaster = true;
        console.log('Making us a seed')
        location.reload();
      }

      console.log('Using', seed, 'as seed');
      datachannel.connect('seed_' + seed.id);
    }

    // Set up DataChannel handlers
    datachannel.onopen = function (userId, channel) {
      console.log('Connected to', userId);
      var node = LocalCluster.nodes[userId];
      if (node) {
        node.channel = channel;
        UI.render();
      }

      if (userId == seed.id) {
        UI.setStatus('Connected to seed');
      }
    };

    datachannel.onleave = function (userId) {
      console.log('Disconnected from', userId);
      if (userId == seed.id) {
        // TODO: reconnect to seed if we lost the cluster
        location.reload();
      }

      var node = LocalCluster.nodes[userId];
      if (node) {
        node.channel = null;
        UI.render();
      }
    };

    datachannel.onmessage = function (message, userId) {
      console.log('Got message', message, 'from', userId);
    };

    datachannel.ondatachannel = function(data_channel) {
      if (data_channel.id == 'seed_' + seed.id) {
        console.log('Joining', data_channel);
        datachannel.join(data_channel);
      } else {
        console.log('Saw channel', data_channel);
      }
    };

    cluster.channel = datachannel;
    return cluster;
  });
};
