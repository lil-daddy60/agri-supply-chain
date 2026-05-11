const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { warehouses, storageRecords, uid } = require('../data/store');

router.get('/warehouses', authenticate, (req, res) => {
  const data = warehouses.map(w => ({
    ...w,
    storageRecords: storageRecords.filter(r => r.warehouseId === w.id).map(r => ({
      ...r,
      crop: { cropType: 'Stored Crop' } // simplified
    }))
  }));
  res.json({ success: true, data });
});

router.post('/warehouses', authenticate, requireRole('ADMIN', 'GOVERNMENT'), (req, res) => {
  const wh = { id: uid(), ...req.body, createdAt: new Date().toISOString() };
  warehouses.push(wh);
  res.status(201).json({ success: true, data: wh });
});

router.put('/warehouses/:id', authenticate, requireRole('ADMIN', 'GOVERNMENT'), (req, res) => {
  const idx = warehouses.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Warehouse not found' });
  warehouses[idx] = { ...warehouses[idx], ...req.body };
  res.json({ success: true, data: warehouses[idx] });
});

router.delete('/warehouses/:id', authenticate, requireRole('ADMIN'), (req, res) => {
  const idx = warehouses.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Warehouse not found' });
  warehouses.splice(idx, 1);
  res.json({ success: true, message: 'Warehouse deleted' });
});

router.post('/records', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const record = { id: uid(), ...req.body, dateStored: new Date().toISOString(), createdAt: new Date().toISOString() };
  storageRecords.push(record);
  res.status(201).json({ success: true, data: record });
});

router.put('/records/:id', authenticate, requireRole('FARMER', 'ADMIN'), (req, res) => {
  const idx = storageRecords.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Record not found' });
  storageRecords[idx] = { ...storageRecords[idx], ...req.body };
  res.json({ success: true, data: storageRecords[idx] });
});

module.exports = router;