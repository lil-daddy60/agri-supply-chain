const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { farmerProfiles, users, farms, crops, uid } = require('../data/store');

router.get('/', authenticate, (req, res) => {
  const data = farmerProfiles.map(fp => ({
    ...fp,
    user: users.find(u => u.id === fp.userId),
    farms: farms.filter(f => f.farmerProfileId === fp.id),
    crops: crops.filter(c => c.farmerProfileId === fp.id)
  }));
  res.json({ success: true, data });
});

router.get('/:id', authenticate, (req, res) => {
  const fp = farmerProfiles.find(p => p.id === req.params.id);
  if (!fp) return res.status(404).json({ success: false, message: 'Farmer not found' });
  res.json({
    success: true,
    data: {
      ...fp,
      user: users.find(u => u.id === fp.userId),
      farms: farms.filter(f => f.farmerProfileId === fp.id),
      crops: crops.filter(c => c.farmerProfileId === fp.id).map(c => ({
        ...c,
        qualityChecks: [],
        storageRecords: []
      }))
    }
  });
});

router.post('/farms', authenticate, requireRole('FARMER'), (req, res) => {
  const fp = farmerProfiles.find(p => p.userId === req.user.id);
  if (!fp) return res.status(404).json({ success: false, message: 'Farmer profile not found' });

  const farm = { id: uid(), farmerProfileId: fp.id, ...req.body, createdAt: new Date().toISOString() };
  farms.push(farm);
  res.status(201).json({ success: true, data: farm });
});

router.put('/farms/:id', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const idx = farms.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Farm not found' });
  farms[idx] = { ...farms[idx], ...req.body };
  res.json({ success: true, data: farms[idx] });
});

router.delete('/farms/:id', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const idx = farms.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Farm not found' });
  farms.splice(idx, 1);
  res.json({ success: true, message: 'Farm deleted' });
});

module.exports = router;