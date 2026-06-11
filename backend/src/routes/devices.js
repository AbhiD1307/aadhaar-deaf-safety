const express = require('express');
const router = express.Router();
const { getDevices, updateDevice, addDevice } = require('../store/alertStore');

router.get('/', (req, res) => res.json(getDevices()));

router.patch('/:id', (req, res) => {
  const device = updateDevice(req.params.id, req.body);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

router.post('/', (req, res) => {
  const { name, location, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type required' });
  const device = addDevice({ name, location: location || 'Unknown', type, enabled: true });
  res.status(201).json(device);
});

module.exports = router;
