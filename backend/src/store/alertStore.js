const { v4: uuidv4 } = require('uuid');

// In-memory store (replace with MongoDB in production)
const alerts = [];
const users = new Map();
const devices = new Map();

// Seed demo user
users.set('user_demo', {
  id: 'user_demo',
  name: 'Abhishek Deshmukh',
  email: 'deshmukh.abhishek152@gmail.com',
  avatar: 'AD',
  trustedContacts: [
    { id: 'c1', name: 'Sara R.', relation: 'Sister', phone: '+15551234567' },
    { id: 'c2', name: 'Mike K.', relation: 'Neighbor', phone: '+15559876543' },
  ],
  settings: {
    flashLights: true,
    vibration: true,
    watchAlerts: true,
    medicalInfo: { bloodType: 'O+', allergies: 'None', conditions: 'Deaf' },
  },
});

// Seed demo devices
const defaultDevices = [
  { id: 'dev1', name: 'Fire alarm', location: 'Living room', type: 'fire_alarm', enabled: true, color: '#FF6B6B' },
  { id: 'dev2', name: 'CO detector', location: 'Kitchen', type: 'co_detector', enabled: true, color: '#FFB347' },
  { id: 'dev3', name: 'Motion sensor', location: 'Front door', type: 'motion', enabled: true, color: '#6B9FFF' },
  { id: 'dev4', name: 'Smart bulb', location: 'Bedroom', type: 'smart_bulb', enabled: false, color: '#77DD77' },
];
defaultDevices.forEach((d) => devices.set(d.id, d));

async function saveAlert(data) {
  const alert = {
    id: uuidv4(),
    deviceId: data.deviceId || 'unknown',
    location: data.location || 'Unknown',
    eventType: data.eventType || data.type || 'unknown',
    riskLevel: data.riskLevel || 'low',
    confidence: data.confidence || 0,
    summary: data.summary || '',
    actions: data.actions || [],
    timestamp: new Date().toISOString(),
    dismissed: false,
    logOnly: data.logOnly || false,
  };
  alerts.unshift(alert);
  if (alerts.length > 500) alerts.pop();
  return alert;
}

function getAlerts({ limit = 50, riskLevel } = {}) {
  let result = alerts;
  if (riskLevel) result = result.filter((a) => a.riskLevel === riskLevel);
  return result.slice(0, limit);
}

function dismissAlert(alertId) {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) alert.dismissed = true;
  return alert;
}

function getUser(userId = 'user_demo') {
  return users.get(userId);
}

function updateUser(userId, updates) {
  const user = users.get(userId) || {};
  const updated = { ...user, ...updates };
  users.set(userId, updated);
  return updated;
}

function getDevices() {
  return Array.from(devices.values());
}

function updateDevice(deviceId, updates) {
  const device = devices.get(deviceId);
  if (!device) return null;
  const updated = { ...device, ...updates };
  devices.set(deviceId, updated);
  return updated;
}

function addDevice(device) {
  const id = `dev_${uuidv4().slice(0, 8)}`;
  const newDevice = { id, ...device };
  devices.set(id, newDevice);
  return newDevice;
}

module.exports = { saveAlert, getAlerts, dismissAlert, getUser, updateUser, getDevices, updateDevice, addDevice };
