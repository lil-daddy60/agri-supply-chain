const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { distributionOrders, orderItems, buyerProfiles, users, transports, notifications, uid } = require('../data/store');
const { sendNotificationToUser } = require('../data/store');

router.get('/', authenticate, (req, res) => {
  const data = distributionOrders.map(o => ({
    ...o,
    buyer: {
      ...buyerProfiles.find(b => b.id === o.buyerId),
      user: users.find(u => u.id === buyerProfiles.find(b => b.id === o.buyerId)?.userId)
    },
    transport: transports.find(t => t.id === o.transportId),
    items: orderItems.filter(i => i.orderId === o.id),
    payments: []
  }));
  res.json({ success: true, data });
});

router.get('/:id', authenticate, (req, res) => {
  const order = distributionOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({
    success: true,
    data: {
      ...order,
      buyer: {
        ...buyerProfiles.find(b => b.id === order.buyerId),
        user: users.find(u => u.id === buyerProfiles.find(b => b.id === order.buyerId)?.userId)
      },
      transport: transports.find(t => t.id === order.transportId),
      items: orderItems.filter(i => i.orderId === order.id),
      payments: []
    }
  });
});

router.post('/', authenticate, requireRole('BUYER_PROCESSOR'), (req, res) => {
  const bp = buyerProfiles.find(p => p.userId === req.user.id);
  if (!bp) return res.status(403).json({ success: false, message: 'Only buyers can create orders' });

  const { items, ...orderData } = req.body;
  const orderId = uid();
  const tracking = uid().slice(0, 8).toUpperCase();

  const order = {
    id: orderId,
    buyerId: bp.id,
    transportId: null,
    status: 'PENDING',
    trackingNumber: tracking,
    ...orderData,
    createdAt: new Date().toISOString()
  };
  distributionOrders.push(order);

  items.forEach(item => {
    orderItems.push({
      id: uid(),
      orderId,
      ...item,
      totalPrice: item.quantity * item.pricePerUnit,
      createdAt: new Date().toISOString()
    });
  });

  // Notify logistics providers
  users.filter(u => u.role === 'LOGISTICS_PROVIDER').forEach(log => {
    const notif = { id: uid(), userId: log.id, type: 'ORDER_UPDATE', title: 'New Distribution Order', message: `Order #${tracking} needs transport`, isRead: false, createdAt: new Date().toISOString() };
    notifications.push(notif);
    sendNotificationToUser(log.id, { title: 'New Distribution Order', message: `Order #${tracking} needs transport` });
  });

  res.status(201).json({ success: true, data: { ...order, items: orderItems.filter(i => i.orderId === orderId) } });
});

router.put('/:id/status', authenticate, requireRole('LOGISTICS_PROVIDER', 'ADMIN', 'BUYER_PROCESSOR'), (req, res) => {
  const idx = distributionOrders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status, transportId } = req.body;
  distributionOrders[idx] = { ...distributionOrders[idx], status, ...(transportId && { transportId }) };

  const order = distributionOrders[idx];
  const bp = buyerProfiles.find(b => b.id === order.buyerId);
  if (bp) {
    const notif = { id: uid(), userId: bp.userId, type: 'ORDER_UPDATE', title: 'Order Status Updated', message: `Your order #${order.trackingNumber} is now ${status}`, isRead: false, createdAt: new Date().toISOString() };
    notifications.push(notif);
    sendNotificationToUser(bp.userId, { title: 'Order Status Updated', message: `Your order #${order.trackingNumber} is now ${status}` });
  }

  res.json({ success: true, data: distributionOrders[idx] });
});

router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => {
  const idx = distributionOrders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  distributionOrders.splice(idx, 1);
  res.json({ success: true, message: 'Order deleted' });
});

module.exports = router;