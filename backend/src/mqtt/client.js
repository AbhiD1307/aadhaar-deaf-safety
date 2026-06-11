const mqtt = require('mqtt');
const logger = require('../utils/logger');
const { classifyEvent } = require('../ai/geminiClassifier');
const { routeAlert } = require('../websocket/alertRouter');
const { saveAlert } = require('../store/alertStore');

let mqttClient = null;

function setupMqttClient(io) {
  const brokerUrl = `mqtt://localhost:${process.env.MQTT_BROKER_PORT || 1883}`;

  mqttClient = mqtt.connect(brokerUrl, {
    clientId: 'aadhar-backend-server',
    clean: true,
    reconnectPeriod: 2000,
  });

  mqttClient.on('connect', () => {
    logger.info('Backend connected to MQTT broker');
    mqttClient.subscribe('aadhar/sensors/#', (err) => {
      if (err) logger.error('MQTT subscribe error:', err.message);
      else logger.info('Subscribed to aadhar/sensors/#');
    });
  });

  mqttClient.on('message', async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      logger.info(`MQTT event: ${topic} - ${JSON.stringify(data)}`);

      // AI classification
      const classification = await classifyEvent(data);
      logger.info(`AI classification: ${JSON.stringify(classification)}`);

      if (classification.riskLevel === 'low') {
        // Log only
        await saveAlert({ ...data, ...classification, logOnly: true });
        return;
      }

      // High/medium risk: fan-out to all channels
      const alert = await saveAlert({ ...data, ...classification });
      await routeAlert(io, alert);

    } catch (err) {
      logger.error(`MQTT message processing error: ${err.message}`);
    }
  });

  mqttClient.on('error', (err) => logger.error(`MQTT client error: ${err.message}`));
  mqttClient.on('reconnect', () => logger.info('MQTT client reconnecting...'));

  return mqttClient;
}

function publishCommand(topic, payload) {
  if (!mqttClient) return;
  mqttClient.publish(`aadhar/commands/${topic}`, JSON.stringify(payload));
}

module.exports = { setupMqttClient, publishCommand };
