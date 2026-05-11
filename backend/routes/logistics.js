const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { transports, logisticsProfiles, users, uid } = require('../data/store');

router.get('/transports', authenticate, (req, res) => {
  const data = transports.map(t => ({
    ...t,
    logistics: {
      ...logisticsProfiles.find(lp => lp.id === t.logisticsId),
      user: users.find(u => u.id === logisticsProfiles.find(lp => lp.id === t.logisticsId)?.userId)
    }
  }));
  res.json({ success: true, data });
});

router.post('/transports', authenticate, requireRole('LOGISTICS_PROVIDER'), (req, res) => {
  const lp = logisticsProfiles.find(p => p.userId === req.user.id);
  if (!lp) return res.status(403).json({ success: false, message: 'Only logistics providers can add vehicles' });

  const transport = { id: uid(), logisticsId: lp.id, isAvailable: true, ...req.body, createdAt: new Date().toISOString() };
  transports.push(transport);
  res.status(201).json({ success: true, data: transport });
});

router.put('/transports/:id', authenticate, requireRole('LOGISTICS_PROVIDER', 'ADMIN'), (req, res) => {
  const idx = transports.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Transport not found' });
  transports[idx] = { ...transports[idx], ...req.body };
  res.json({ success: true, data: transports[idx] });
});

router.delete('/transports/:id', authenticate, requireRole('LOGISTICS_PROVIDER', 'ADMIN'), (req, res) => {
  const idx = transports.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Transport not found' });
  transports.splice(idx, 1);
  res.json({ success: true, message: 'Transport deleted' });
});

module.exports = router;