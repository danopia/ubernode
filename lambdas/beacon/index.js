'use strict';

var config = require('./config');
var Pusher = require('pusher');
var pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret,
  encrypted: true,
});

let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
exports.handler = (event, context, callback) => {
  console.log(event);
  const clusterId = event.params.path.clusterId;
  const nodeId = event['body-json'].nodeId;
  const secret = event['body-json'].secret;

  // also context (source-ip, stage, user-agent, api-key)
  // also params (header, path, querystring)
  // also stage-variables

  dynamo.getItem({
    TableName: 'Uber_Nodes',
    Key: {
      clusterId: clusterId,
      nodeId: nodeId,
    },
    // ProjectionExpression: '...',
  }, (err, nodeResp) => {
    if (err) {
      return callback(err);
    }
    const node = nodeResp.Item;

    if (node.secret !== secret) {
      throw new Error('Incorrect secret for node');
    }

    // TODO: use updateItem
    node.lastSeen = new Date().toJSON();
    node.socketId = event['body-json'].socketId;
    dynamo.putItem({
      TableName: 'Uber_Nodes',
      Item: node,
    }, (err) => {
      if (err) {
        return callback(err);
      }

      pusher.trigger(
        // TODO: verify this a little
        event['body-json'].target, // 'cluster_' + clusterId,
        'message',
        event['body-json'].message,
        event['body-json'].socketId);

      callback(null, true);
    });
  });
};
