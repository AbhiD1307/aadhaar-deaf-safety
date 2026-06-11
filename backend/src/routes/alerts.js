const express = require('express');
const router = express.Router();
const { getAlerts, dismissAlert, saveAlert } = require('../store/alertStore');
const { classifyEvent } = require('../ai/geminiClassifier');
const { routeAlert } = require('../websocket/alertRouter');

router.get('/', (req, res) => {
  const { limit = 50, riskLevel } = req.query;
  res.json(getAlerts({ limit: parseInt(limit), riskLevel }));
});

router.post('/:id/dismiss', (req, res) => {
  const alert = dismissAlert(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const io = req.app.get('io');
  io.emit('alert_dismissed', { alertId: req.params.id });
  res.json({ success: true, alert });
});

// Simulate an alert via REST (for testing without physical sensors)
router.post('/simulate', async (req, res) => {
  try {
    const sensorData = {
      deviceId: req.body.deviceId || 'sim_001',
      type: req.body.type || 'fire_alarm',
      value: req.body.value,
      location: req.body.location || 'Living Room',
      timestamp: Date.now(),
      seq: Date.now(),
    };

    const classification = await classifyEvent(sensorData);
    const alert = await saveAlert({ ...sensorData, ...classification });

    if (classification.riskLevel !== 'low') {
      const io = req.app.get('io');
      await routeAlert(io, alert);
    }

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
