const express = require('express');
const router = express.Router();
const { getUser, updateUser } = require('../store/alertStore');

router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/:id', (req, res) => {
  const user = updateUser(req.params.id, req.body);
  res.json(user);
});

router.patch('/:id/settings', (req, res) => {
  const current = getUser(req.params.id);
  if (!current) return res.status(404).json({ error: 'User not found' });
  const updated = updateUser(req.params.id, {
    settings: { ...current.settings, ...req.body },
  });
  res.json(updated);
});

router.post('/:id/contacts', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, relation, phone } = req.body;
  const newContact = { id: `c_${Date.now()}`, name, relation, phone };
  const updated = updateUser(req.params.id, {
    trustedContacts: [...(user.trustedContacts || []), newContact],
  });
  res.status(201).json(updated.trustedContacts);
});

module.exports = router;
