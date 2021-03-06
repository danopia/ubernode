'use strict';

var config = require('./config');
var Pusher = require('pusher');
var pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret,
  encrypted: true,
});

exports.handler = (event, context, callback) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));

  event.Records.forEach((record) => {
    if (record.eventName == 'INSERT') {
      var entry = record.dynamodb.NewImage; // also SequenceNumber

      pusher.trigger(
        'cluster_' + entry.clusterId.S,
        'membership-log',
        entry);
    }
  });
  callback(null, `Successfully processed ${event.Records.length} records.`);
};
