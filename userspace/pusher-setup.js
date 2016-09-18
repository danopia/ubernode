self.exports = new Promise((resolve, reject) => {
  // Enable pusher logging - don't include this in production
  Pusher.logToConsole = false;

  // Open a connection to Pusher
  var pusher = new Pusher('d2945d1fae2ef9fdb1b6', {
    encrypted: true,
  });

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
