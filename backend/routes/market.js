const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { marketListings, crops, farmerProfiles, users, buyerProfiles, marketTransactions, marketPrices, notifications, uid } = require('../data/store');
const { sendNotificationToUser } = require('../data/store');

router.get('/listings', authenticate, (req, res) => {
  const data = marketListings.filter(l => l.isActive).map(l => ({
    ...l,
    crop: {
      ...crops.find(c => c.id === l.cropId),
      farmerProfile: {
        ...farmerProfiles.find(fp => fp.id === crops.find(c => c.id === l.cropId)?.farmerProfileId),
        user: users.find(u => u.id === farmerProfiles.find(fp => fp.id === crops.find(c => c.id === l.cropId)?.farmerProfileId)?.userId)
      }
    },
    transactions: marketTransactions.filter(t => t.listingId === l.id)
  }));
  res.json({ success: true, data });
});

router.post('/listings', authenticate, requireRole('FARMER'), (req, res) => {
  const { cropId, listedPrice, minimumQuantity, availableQuantity, expiryDate } = req.body;
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

  const fp = farmerProfiles.find(f => f.id === crop.farmerProfileId);
  if (!fp || fp.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

  const listing = {
    id: uid(),
    cropId,
    listedPrice,
    minimumQuantity: minimumQuantity || null,
    availableQuantity,
    expiryDate: expiryDate || null,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  marketListings.push(listing);

  // Notify buyers
  users.filter(u => u.role === 'BUYER_PROCESSOR').forEach(buyer => {
    const notif = { id: uid(), userId: buyer.id, type: 'PRICE_ALERT', title: 'New Market Listing', message: `${crop.cropType} available at $${listedPrice}/kg`, isRead: false, createdAt: new Date().toISOString() };
    notifications.push(notif);
    sendNotificationToUser(buyer.id, { title: 'New Market Listing', message: `${crop.cropType} available at $${listedPrice}/kg` });
  });

  res.status(201).json({ success: true, data: listing });
});

router.post('/transactions', authenticate, requireRole('BUYER_PROCESSOR'), (req, res) => {
  const bp = buyerProfiles.find(p => p.userId === req.user.id);
  if (!bp) return res.status(403).json({ success: false, message: 'Only buyers can purchase' });

  const { listingId, quantity, pricePerUnit } = req.body;
  const listing = marketListings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

  const totalAmount = quantity * pricePerUnit;
  const transaction = {
    id: uid(),
    listingId,
    buyerId: bp.id,
    quantity,
    pricePerUnit,
    totalAmount,
    transactionDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  marketTransactions.push(transaction);

  // Update listing
  listing.availableQuantity -= quantity;
  if (listing.availableQuantity <= 0) listing.isActive = false;

  // Notify farmer
  const crop = crops.find(c => c.id === listing.cropId);
  if (crop) {
    const fp = farmerProfiles.find(f => f.id === crop.farmerProfileId);
    if (fp) {
      const buyerUser = users.find(u => u.id === bp.userId);
      const notif = { id: uid(), userId: fp.userId, type: 'PAYMENT_RECEIVED', title: 'Produce Sold', message: `${quantity}kg sold to ${buyerUser?.firstName || 'Buyer'}`, isRead: false, createdAt: new Date().toISOString() };
      notifications.push(notif);
      sendNotificationToUser(fp.userId, { title: 'Produce Sold', message: `${quantity}kg sold to ${buyerUser?.firstName || 'Buyer'}` });
    }
  }

  res.status(201).json({ success: true, data: transaction });
});

router.get('/prices', authenticate, (req, res) => {
  const { cropType, location } = req.query;
  let data = [...marketPrices].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (cropType) data = data.filter(p => p.cropType.toLowerCase() === cropType.toLowerCase());
  if (location) data = data.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
  res.json({ success: true, data });
});

router.post('/prices', authenticate, requireRole('GOVERNMENT', 'ADMIN'), (req, res) => {
  const price = { id: uid(), ...req.body, date: new Date().toISOString(), createdAt: new Date().toISOString() };
  marketPrices.push(price);
  res.status(201).json({ success: true, data: price });
});

module.exports = router;