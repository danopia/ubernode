'use strict';

let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
exports.handler = (event, context, callback) => {
  // existing nodes
  const nodeId = event['body-json'].nodeId;

  // new nodes
  const inviteId = event['body-json'].inviteId;

  const nodeVersion = event['body-json'].nodeVersion;

  // also context (source-ip, stage, user-agent, api-key)
  // also params (header, path, querystring)
  // also stage-variables

  if (nodeId) {
    const clusterId = event['body-json'].clusterId;
    const secret = event['body-json'].secret;

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
      node.runningVersion = nodeVersion;
      dynamo.putItem({
        TableName: 'Uber_Nodes',
        Item: node,
      }, (err) => {
        if (err) {
          return callback(err);
        }

        dynamo.query({
          TableName: 'Uber_Nodes',
          KeyConditionExpression: 'clusterId = :cId',
          ExpressionAttributeValues: {
            ':cId': clusterId,
          },
          ProjectionExpression: 'nodeId, lastSeen, runningVersion',
          Limit: 20,
        }, (err, resp) => {
          if (err) {
            return callback(err);
          }

          dynamo.getItem({
            TableName: 'Uber_Clusters',
            Key: {
              clusterId: clusterId,
            },
            // ProjectionExpression: '...',
          }, (err, clusterResp) => {
            if (err) {
              return callback(err);
            }
            const cluster = clusterResp.Item;
            cluster.apps = Object.keys(cluster.apps.contents);

            callback(null, {
              cluster: cluster,
              nodes: resp.Items,
            });
          });
        });
      });
    });

  } else {
    dynamo.getItem({
      TableName: 'Uber_Invites',
      Key: {
        inviteId: inviteId,
      },
      // ProjectionExpression: '...',
    }, (err, inviteResp) => {
      if (err) {
        return callback(err);
      }
      const invite = inviteResp.Item;

      if (!invite.redeemable) {
        return callback(new Error("Invite is not redeemable"));
      }

      dynamo.getItem({
        TableName: 'Uber_Clusters',
        Key: {
          clusterId: invite.clusterId,
        },
        // ProjectionExpression: '...',
      }, (err, clusterResp) => {
        if (err) {
          return callback(err);
        }
        const cluster = clusterResp.Item;
        cluster.apps = Object.keys(cluster.apps.contents);

        genUUID((err, nodeId) => {
          genUUID((err, secret) => {

            dynamo.putItem({
              TableName: 'Uber_MembershipLog',
              Item: {
                clusterId: cluster.clusterId,
                nodeId: nodeId,
                timestamp: new Date().toJSON(),
                nodeVersion: nodeVersion,
                action: 'joined',
              },
              ConditionExpression: 'attribute_not_exists(clusterId)',
            }, (err) => {
              if (err) {
                return callback(err);
              }

              dynamo.putItem({
                TableName: 'Uber_Nodes',
                Item: {
                  clusterId: cluster.clusterId,
                  nodeId: nodeId,
                  runningVersion: nodeVersion,
                  initialMetadata: {
                    nodeVersion: nodeVersion,
                    inviteId: inviteId,
                    ipAddress: event.context['source-ip'],
                    userAgent: event.context['user-agent'],
                    apiKey: event.context['api-key'],
                  },
                  secret: secret,
                  firstSeen: new Date().toJSON(),
                  lastSeen: new Date().toJSON(),
                },
                ConditionExpression: 'attribute_not_exists(nodeId)',
              }, (err) => {
                if (err) {
                  return callback(err);
                }

                dynamo.query({
                  TableName: 'Uber_Nodes',
                  KeyConditions: {
                    clusterId: cluster.clusterId,
                  },
                  ProjectionExpression: 'nodeId, lastSeen, runningVersion',
                  Limit: 20,
                }, (err, resp) => {
                  if (err) {
                    return callback(err);
                  }

                  callback(null, {
                    cluster: cluster,
                    nodeId: nodeId,
                    secret: secret,
                    inviteId: inviteId,
                    nodes: resp.Items,
                  });
                });
              });
            });
          });
        });
      });
    });
  }
};

let crypto = require('crypto');
function genUUID(callback) {
  crypto.randomBytes(16, function(err, rnd) {
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    callback(null, rnd.join('-'));
  });
}
