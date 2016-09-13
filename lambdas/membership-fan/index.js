'use strict';

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
