const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { farmerProfiles, crops, distributionOrders, warehouses, qualityChecks, users } = require('../data/store');

router.get('/dashboard', authenticate, (req, res) => {
  const recentCrops = [...crops]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(c => {
      const fp = farmerProfiles.find(fp => fp.id === c.farmerProfileId);
      const user = fp ? users.find(u => u.id === fp.userId) : null;
      return {
        ...c,
        farmerProfile: {
          user: user ? { firstName: user.firstName, lastName: user.lastName } : { firstName: 'Unknown', lastName: '' }
        }
      };
    });

  const statusMap = {};
  distributionOrders.forEach(o => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });
  const orderStatusCounts = Object.entries(statusMap).map(([status, count]) => ({
    status,
    _count: { status: count }
  }));

  res.json({
    success: true,
    data: {
      counts: {
        totalFarmers: farmerProfiles.length,
        totalCrops: crops.length,
        totalOrders: distributionOrders.length,
        totalWarehouses: warehouses.length
      },
      recentCrops,
      orderStatusCounts
    }
  });
});

router.get('/production', authenticate, (req, res) => {
  const totalProduction = crops.reduce((sum, c) => sum + (c.quantity || 0), 0);
  const qualityChecked = crops.filter(c => qualityChecks.some(q => q.cropId === c.id)).length;

  res.json({
    success: true,
    data: {
      totalProduction,
      totalBatches: crops.length,
      qualityCheckedBatches: qualityChecked,
      crops
    }
  });
});

router.get('/distribution', authenticate, (req, res) => {
  const delivered = distributionOrders.filter(o => o.status === 'DELIVERED').length;
  const total = distributionOrders.length;
  const rate = total > 0 ? (delivered / total) * 100 : 0;

  res.json({
    success: true,
    data: {
      totalOrders: total,
      deliveredOrders: delivered,
      deliveryRate: rate,
      orders: distributionOrders
    }
  });
});

module.exports = router;