const logger = require('../utils/logger');
const { sendSMS } = require('../notifications/smsService');
const { sendPushNotification } = require('../notifications/pushService');

async function routeAlert(io, alert) {
  logger.info(`Routing alert: ${alert.eventType} (${alert.riskLevel})`);

  // 1. Push to all connected app clients via WebSocket
  io.emit('alert', alert);

  // 2. Channel-specific fanout based on actions
  const promises = [];

  if (alert.actions.includes('flash_lights')) {
    io.emit('smart_home_command', { command: 'flash_lights', pattern: 'sos', duration: 30000 });
    logger.info('Smart bulb flash command sent');
  }

  if (alert.actions.includes('vibrate')) {
    io.emit('haptic_command', { pattern: 'emergency', intensity: 'high' });
  }

  if (alert.actions.includes('notify_contacts') && alert.riskLevel === 'high') {
    // Get user's trusted contacts (in production, look up by userId)
    const { getUser } = require('../store/alertStore');
    const user = getUser('user_demo');
    if (user?.trustedContacts) {
      user.trustedContacts.forEach((contact) => {
        promises.push(
          sendSMS(contact.phone, buildSMSMessage(alert, user)).catch((err) =>
            logger.error(`SMS to ${contact.name} failed: ${err.message}`)
          )
        );
      });
    }
  }

  if (alert.actions.includes('full_screen_alert')) {
    promises.push(
      sendPushNotification({
        title: `⚠️ ${formatEventType(alert.eventType)}`,
        body: `${alert.summary} — Tap to respond`,
        data: { alertId: alert.id, type: 'emergency' },
        priority: 'high',
      }).catch((err) => logger.error(`Push notification failed: ${err.message}`))
    );
  }

  await Promise.allSettled(promises);
  logger.info(`Alert routing complete for ${alert.id}`);
}

function buildSMSMessage(alert, user) {
  return `🚨 AADHAR EMERGENCY ALERT
${user.name} needs help!
Event: ${formatEventType(alert.eventType)}
Location: ${alert.location}
Time: ${new Date(alert.timestamp).toLocaleTimeString()}
Tap SOS for location: https://aadhar.app/sos/${alert.id}`;
}

function formatEventType(type) {
  const map = {
    fire_alarm: 'Fire Alarm',
    co_alarm: 'CO Gas Alert',
    glass_break: 'Glass Break',
    intruder: 'Intruder Alert',
    motion: 'Motion Detected',
    doorbell: 'Doorbell',
    baby_cry: 'Baby Crying',
    smoke: 'Smoke Detected',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { routeAlert };
