require('dotenv').config({ path: '../backend/.env' });
const mqtt = require('mqtt');
const crypto = require('crypto');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const HMAC_SECRET = process.env.MQTT_HMAC_SECRET || 'aadhar-dev-hmac-secret';

// Parse CLI arg: --event fire_alarm
const args = process.argv.slice(2);
const eventArgIdx = args.indexOf('--event');
const forcedEvent = eventArgIdx >= 0 ? args[eventArgIdx + 1] : null;

const SENSORS = [
  { deviceId: 'fire_sensor_01', location: 'Living Room', type: 'fire_alarm', topic: 'aadhar/sensors/fire' },
  { deviceId: 'co_sensor_01', location: 'Kitchen', type: 'co_alarm', topic: 'aadhar/sensors/co' },
  { deviceId: 'motion_01', location: 'Front Door', type: 'motion', topic: 'aadhar/sensors/motion' },
  { deviceId: 'doorbell_01', location: 'Front Door', type: 'doorbell', topic: 'aadhar/sensors/doorbell' },
  { deviceId: 'mic_01', location: 'Living Room', type: 'glass_break', topic: 'aadhar/sensors/mic' },
];

let sequenceCounters = {};

function signPayload(payload) {
  const { hmac, ...body } = payload;
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  return { ...body, hmac: signature };
}

function buildPayload(sensor) {
  const seq = (sequenceCounters[sensor.deviceId] || 0) + 1;
  sequenceCounters[sensor.deviceId] = seq;

  const base = {
    deviceId: sensor.deviceId,
    type: sensor.type,
    location: sensor.location,
    timestamp: Date.now(),
    seq,
    value: getRandomValue(sensor.type),
  };
  return signPayload(base);
}

function getRandomValue(type) {
  switch (type) {
    case 'co_alarm': return Math.floor(Math.random() * 200) + 100; // ppm
    case 'motion': return 1;
    case 'fire_alarm': return 1;
    default: return 1;
  }
}

const client = mqtt.connect(BROKER_URL, {
  clientId: `aadhar-simulator-${Date.now()}`,
  clean: true,
});

client.on('connect', () => {
  console.log(`[Simulator] Connected to ${BROKER_URL}`);

  if (forcedEvent) {
    // Publish a single forced event and exit
    const sensor = SENSORS.find((s) => s.type === forcedEvent) || SENSORS[0];
    const payload = buildPayload({ ...sensor, type: forcedEvent });
    client.publish(sensor.topic, JSON.stringify(payload), { qos: 1 }, () => {
      console.log(`[Simulator] Published: ${forcedEvent} → ${sensor.topic}`);
      console.log(JSON.stringify(payload, null, 2));
      client.end();
    });
    return;
  }

  console.log('[Simulator] Running continuous simulation. Press Ctrl+C to stop.');
  console.log('[Simulator] Tip: use --event fire_alarm to trigger a specific event\n');

  // Continuous random simulation
  function publishRandom() {
    const sensor = SENSORS[Math.floor(Math.random() * SENSORS.length)];
    const payload = buildPayload(sensor);
    client.publish(sensor.topic, JSON.stringify(payload), { qos: 1 });
    console.log(`[Simulator] ${new Date().toLocaleTimeString()} ${sensor.type} @ ${sensor.location}`);

    // Schedule next event: 5-15 seconds
    const delay = 5000 + Math.random() * 10000;
    setTimeout(publishRandom, delay);
  }

  // Start with a fire alarm after 2 seconds for demo
  setTimeout(() => {
    const fireSensor = SENSORS[0];
    const payload = buildPayload(fireSensor);
    client.publish(fireSensor.topic, JSON.stringify(payload), { qos: 1 });
    console.log(`[Simulator] DEMO: fire_alarm @ Living Room`);
  }, 2000);

  setTimeout(publishRandom, 15000);
});

client.on('error', (err) => {
  console.error(`[Simulator] Connection error: ${err.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n[Simulator] Shutting down...');
  client.end();
  process.exit(0);
});
