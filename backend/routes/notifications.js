const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { notifications } = require('../data/store');

router.get('/', authenticate, (req, res) => {
  const data = notifications
    .filter(n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data });
});

router.get('/unread-count', authenticate, (req, res) => {
  const count = notifications.filter(n => n.userId === req.user.id && !n.isRead).length;
  res.json({ success: true, data: { count } });
});

router.put('/:id/read', authenticate, (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Notification not found' });
  notifications[idx].isRead = true;
  res.json({ success: true, data: notifications[idx] });
});

router.put('/read-all', authenticate, (req, res) => {
  notifications.filter(n => n.userId === req.user.id && !n.isRead).forEach(n => n.isRead = true);
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router;