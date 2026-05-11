const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { crops, farmerProfiles, qualityChecks, notifications, uid } = require('../data/store');
const { sendNotificationToUser } = require('../data/store');

router.get('/', authenticate, (req, res) => {
  const data = crops.map(c => ({
    ...c,
    farmerProfile: farmerProfiles.find(fp => fp.id === c.farmerProfileId),
    qualityChecks: qualityChecks.filter(q => q.cropId === c.id)
  }));
  res.json({ success: true, data });
});

router.get('/:id', authenticate, (req, res) => {
  const crop = crops.find(c => c.id === req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
  res.json({
    success: true,
    data: {
      ...crop,
      qualityChecks: qualityChecks.filter(q => q.cropId === crop.id),
      storageRecords: [],
      marketListings: []
    }
  });
});

router.post('/', authenticate, requireRole('FARMER'), (req, res) => {
  const fp = farmerProfiles.find(p => p.userId === req.user.id);
  if (!fp) return res.status(403).json({ success: false, message: 'Only farmers can register crops' });

  const crop = { id: uid(), farmerProfileId: fp.id, status: 'PLANTED', ...req.body, createdAt: new Date().toISOString() };
  crops.push(crop);

  // Notify government users
  const { users } = require('../data/store');
  users.filter(u => u.role === 'GOVERNMENT').forEach(gov => {
    const notif = { id: uid(), userId: gov.id, type: 'SYSTEM', title: 'New Crop Registered', message: `${fp.farmName} registered ${req.body.cropType}`, isRead: false, createdAt: new Date().toISOString() };
    notifications.push(notif);
    sendNotificationToUser(gov.id, { title: 'New Crop Registered', message: `${fp.farmName} registered ${req.body.cropType}` });
  });

  res.status(201).json({ success: true, data: crop });
});

router.put('/:id', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const idx = crops.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Crop not found' });
  crops[idx] = { ...crops[idx], ...req.body };
  res.json({ success: true, data: crops[idx] });
});

router.delete('/:id', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const idx = crops.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Crop not found' });
  crops.splice(idx, 1);
  res.json({ success: true, message: 'Crop deleted' });
});

router.post('/quality-check', authenticate, requireRole('GOVERNMENT', 'ADMIN'), (req, res) => {
  const { cropId, grade, moistureContent, purity, remarks } = req.body;
  const qc = { id: uid(), cropId, checkedById: req.user.id, grade, moistureContent, purity, remarks, checkDate: new Date().toISOString(), createdAt: new Date().toISOString() };
  qualityChecks.push(qc);

  const crop = crops.find(c => c.id === cropId);
  if (crop) {
    const fp = farmerProfiles.find(f => f.id === crop.farmerProfileId);
    if (fp) {
      const notif = { id: uid(), userId: fp.userId, type: 'QUALITY_CHECK', title: 'Quality Check Completed', message: `Your ${crop.cropType} has been graded ${grade}`, isRead: false, createdAt: new Date().toISOString() };
      notifications.push(notif);
      sendNotificationToUser(fp.userId, { title: 'Quality Check Completed', message: `Your ${crop.cropType} has been graded ${grade}` });
    }
  }

  res.status(201).json({ success: true, data: qc });
});

module.exports = router;