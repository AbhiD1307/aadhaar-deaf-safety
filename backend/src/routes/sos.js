const express = require('express');
const router = express.Router();
const { getUser } = require('../store/alertStore');
const { sendSMS } = require('../notifications/smsService');
const logger = require('../utils/logger');

router.post('/trigger', async (req, res) => {
  try {
    const { latitude, longitude, alertId, userId = 'user_demo' } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const location = latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Location unavailable';

    const message = `🚨 SOS EMERGENCY from ${user.name}
They need immediate help!
Location: ${location}
Time: ${new Date().toLocaleString()}
Medical info: ${user.settings?.medicalInfo?.conditions || 'See Aadhar profile'}`;

    const io = req.app.get('io');
    io.emit('sos_active', { userId, latitude, longitude, timestamp: new Date().toISOString() });

    const results = await Promise.allSettled(
      user.trustedContacts.map((contact) => sendSMS(contact.phone, message))
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    logger.info(`SOS dispatched: ${sent}/${user.trustedContacts.length} contacts notified`);

    res.json({
      success: true,
      contactsNotified: sent,
      totalContacts: user.trustedContacts.length,
      location,
    });
  } catch (err) {
    logger.error(`SOS trigger error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
