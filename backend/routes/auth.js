const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { authenticate, generateToken } = require('../middleware/auth');
const { users, farmerProfiles, supplierProfiles, logisticsProfiles, buyerProfiles, governmentProfiles, financialProfiles, uid } = require('../data/store');

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, profile } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uid();

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role,
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    users.push(user);

    // Create role-specific profile
    const profileId = uid();
    if (role === 'FARMER' && profile) {
      farmerProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    } else if (role === 'INPUT_SUPPLIER' && profile) {
      supplierProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    } else if (role === 'LOGISTICS_PROVIDER' && profile) {
      logisticsProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    } else if (role === 'BUYER_PROCESSOR' && profile) {
      buyerProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    } else if (role === 'GOVERNMENT' && profile) {
      governmentProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    } else if (role === 'FINANCIAL_INSTITUTION' && profile) {
      financialProfiles.push({ id: profileId, userId, ...profile, createdAt: new Date().toISOString() });
    }

    const token = generateToken(userId, role);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email, firstName, lastName, role },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const profile = farmerProfiles.find(p => p.userId === user.id) ||
                  supplierProfiles.find(p => p.userId === user.id) ||
                  logisticsProfiles.find(p => p.userId === user.id) ||
                  buyerProfiles.find(p => p.userId === user.id) ||
                  governmentProfiles.find(p => p.userId === user.id) ||
                  financialProfiles.find(p => p.userId === user.id);

  res.json({ success: true, data: { ...user, password: undefined, profile } });
});

module.exports = router;