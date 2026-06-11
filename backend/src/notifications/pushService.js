const logger = require('../utils/logger');

let firebaseAdmin = null;

function getFirebase() {
  if (!firebaseAdmin && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    firebaseAdmin = admin;
  }
  return firebaseAdmin;
}

async function sendPushNotification({ title, body, data = {}, token, topic = 'aadhar-alerts', priority = 'high' }) {
  const firebase = getFirebase();

  if (!firebase) {
    logger.warn(`[PUSH MOCK] ${title}: ${body}`);
    return { mock: true };
  }

  const message = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: 'high', notification: { channelId: 'aadhar_emergency' } },
    apns: { headers: { 'apns-priority': '10' } },
    ...(token ? { token } : { topic }),
  };

  const response = await firebase.messaging().send(message);
  logger.info(`Push notification sent: ${response}`);
  return response;
}

module.exports = { sendPushNotification };
