const aedes = require('aedes');
const net = require('net');
const crypto = require('crypto');
const logger = require('../utils/logger');

const HMAC_SECRET = process.env.MQTT_HMAC_SECRET || 'aadhar-dev-hmac-secret';

// In-memory sequence tracker per client to prevent replay attacks
const clientSequences = new Map();

function verifyHmac(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());
    if (!data.hmac || !data.seq || !data.timestamp) return false;

    const { hmac, ...body } = data;
    const expected = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hmac !== expected) return false;

    // Replay protection: reject old or duplicate sequences
    const clientId = body.deviceId;
    const lastSeq = clientSequences.get(clientId) || 0;
    if (body.seq <= lastSeq) return false;
    clientSequences.set(clientId, body.seq);

    // Reject stale messages (older than 30 seconds)
    const age = Date.now() - body.timestamp;
    if (age > 30000 || age < -5000) return false;

    return true;
  } catch {
    return false;
  }
}

function startMqttBroker(port) {
  return new Promise((resolve, reject) => {
    const broker = aedes();

    broker.authenticate = (client, username, password, callback) => {
      // In production, verify against Auth0 or device registry
      // Dev mode: accept all with a shared token
      const token = password ? password.toString() : '';
      const valid = process.env.NODE_ENV === 'development' || token === process.env.MQTT_DEVICE_TOKEN;
      callback(null, valid);
    };

    broker.authorizePublish = (client, packet, callback) => {
      const allowed = packet.topic.startsWith('aadhar/sensors/') ||
                      packet.topic.startsWith('aadhar/commands/');
      if (!allowed) {
        logger.warn(`Blocked publish to unauthorized topic: ${packet.topic}`);
        return callback(new Error('Unauthorized topic'));
      }
      callback(null);
    };

    broker.on('publish', (packet, client) => {
      if (!client) return; // system messages

      const topic = packet.topic;
      if (!topic.startsWith('aadhar/sensors/')) return;

      const valid = verifyHmac(topic, packet.payload);
      if (!valid) {
        logger.warn(`HMAC verification failed for client ${client.id} on ${topic}`);
      }
    });

    broker.on('client', (client) => logger.info(`MQTT client connected: ${client.id}`));
    broker.on('clientDisconnect', (client) => logger.info(`MQTT client disconnected: ${client.id}`));
    broker.on('error', (err) => logger.error(`MQTT broker error: ${err.message}`));

    const server = net.createServer(broker.handle);
    server.listen(port, () => {
      logger.info(`MQTT broker listening on port ${port}`);
      resolve(broker);
    });
    server.on('error', reject);
  });
}

module.exports = { startMqttBroker };
