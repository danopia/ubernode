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
      var doc = collapseTypes(entry);

      console.log('Pushing log entry', doc);
      pusher.trigger(
        'cluster_' + doc.clusterId,
        'membership-log',
        doc);
    }
  });
  callback(null, `Successfully processed ${event.Records.length} records.`);
};

function collapseTypes(doc) {
  let cleanDoc = {};
  Object.keys(doc).forEach(key => {
    let typeKey = Object.keys(doc[key])[0];
    cleanDoc[key] = doc[key][typeKey];
  });
  return cleanDoc;
}
