var pusherSetup = new Promise((resolve, reject) => {
  // Enable pusher logging - don't include this in production
  Pusher.logToConsole = true;

  // Open a connection to Pusher
  var pusher = new Pusher('d2945d1fae2ef9fdb1b6', {
    encrypted: true,
  });

  Pusher.log = function(message) {
    console.log(message);
  };

  pusher.connection.bind('state_change', (states) => {
    switch (states.current) {
      case "connected":
        resolve(pusher);
        break;
      case "disconnected":
      case "failed":
      case "unavailable":
        break;
    }
  });

  // TODO: fail after timeout
});

function seedGrid(cluster) {
  var channelId = 'cluster_' + cluster.id;

  return pusherSetup
    .then((pusher) => {
      // Initialise DataChannel.js
      var datachannel = new DataChannel();
      datachannel.userid = window.LocalNode.id;
      datachannel.cluster = cluster;

      // Set custom Pusher signalling channel
      // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
      datachannel.openSignalingChannel = function(config) {
        var xhrErrorCount = 0;
        var channel = config.channel || this.channel;

        // Subscribe to Pusher signalling channel
        var pusherChannel = pusher.subscribe(channel);

        var socket = {
          channel: channel,
          send: function(message) {
            UberNet.beacon({
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
      return datachannel;

    }).then((datachannel) => {
      if (localStorage.isMaster) {
        datachannel.open(channelId);
      } else {
        datachannel.connect(channelId);
      }
      datachannel.send('Hi! ' + LocalNode.id);

      // Set up DataChannel handlers
      datachannel.onopen = function (userId) {
        console.log('Connected to', userId);
      };

      datachannel.onmessage = function (message, userId) {
        console.log('Got message', message, 'from', userId);
      };

      datachannel.ondatachannel = function(data_channel) {
        console.log('Joining', data_channel);
        datachannel.join(data_channel);
      };

      cluster.channel = datachannel;
      return cluster;
    });

  /*
  var onCreateChannel = function() {
    var channelName = cleanChannelName(channelInput.value);

    if (!channelName) {
      console.log("No channel name given");
      return;
    }

    disableConnectInput();

    datachannel.open(channelName);
  };

  var onJoinChannel = function() {
    var channelName = cleanChannelName(channelInput.value);

    if (!channelName) {
      console.log("No channel name given");
      return;
    }

    disableConnectInput();

    // Search for existing data channels
    datachannel.connect(channelName);
  };

  var cleanChannelName = function(channel) {
    return channel.replace(/(\W)+/g, "-").toLowerCase();
  };

  var onSendMessage = function() {
    var message = messageInput.value;

    if (!message) {
      console.log("No message given");
      return;
    }

    datachannel.send(message);
    addMessage(message, window.userid, true);

    messageInput.value = "";
  };

  var onMessageKeyDown = function(event) {
    if (event.keyCode == 13){
      onSendMessage();
    }
  };
  */

}
