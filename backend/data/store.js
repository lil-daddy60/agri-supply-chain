const { v4: uuidv4 } = require('uuid');

// In-memory data stores
const users = [];
const farmerProfiles = [];
const supplierProfiles = [];
const logisticsProfiles = [];
const buyerProfiles = [];
const governmentProfiles = [];
const financialProfiles = [];
const farms = [];
const crops = [];
const inputSupplies = [];
const qualityChecks = [];
const warehouses = [];
const storageRecords = [];
const transports = [];
const distributionOrders = [];
const orderItems = [];
const marketListings = [];
const marketTransactions = [];
const marketPrices = [];
const payments = [];
const notifications = [];
const chatMessages = [];

// Helper: get next auto-increment-like ID
const uid = () => uuidv4();

// Helper: seed initial data
function seedData() {
  // Seed admin
  const bcrypt = require('bcryptjs');
  const adminId = uid();
  users.push({
    id: adminId,
    email: 'admin@agrisupply.com',
    password: bcrypt.hashSync('admin123', 10),
    firstName: 'System',
    lastName: 'Admin',
    phone: '+1234567890',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date().toISOString()
  });

  // Seed a farmer
  const farmerUserId = uid();
  users.push({
    id: farmerUserId,
    email: 'farmer@demo.com',
    password: bcrypt.hashSync('password', 10),
    firstName: 'John',
    lastName: 'Doe',
    phone: '+2348012345678',
    role: 'FARMER',
    isVerified: true,
    createdAt: new Date().toISOString()
  });

  const farmerProfId = uid();
  farmerProfiles.push({
    id: farmerProfId,
    userId: farmerUserId,
    farmName: 'Green Valley Farm',
    farmLocation: 'Ibadan, Oyo State',
    farmSize: 25,
    farmSizeUnit: 'acres',
    primaryCrops: ['Maize', 'Cassava'],
    certifications: ['Organic'],
    createdAt: new Date().toISOString()
  });

  farms.push({
    id: uid(),
    farmerProfileId: farmerProfId,
    name: 'Plot A',
    location: 'Ibadan North',
    size: 10,
    sizeUnit: 'acres',
    soilType: 'Loamy',
    irrigationType: 'Drip',
    createdAt: new Date().toISOString()
  });

  // Seed crops
  const crop1 = uid();
  crops.push({
    id: crop1,
    farmerProfileId: farmerProfId,
    cropType: 'Maize',
    variety: 'Yellow Maize',
    quantity: 5000,
    unit: 'kg',
    plantingDate: '2026-03-01T00:00:00.000Z',
    expectedHarvest: '2026-07-01T00:00:00.000Z',
    actualHarvest: null,
    status: 'GROWING',
    createdAt: new Date().toISOString()
  });

  const crop2 = uid();
  crops.push({
    id: crop2,
    farmerProfileId: farmerProfId,
    cropType: 'Cassava',
    variety: 'TME 419',
    quantity: 3000,
    unit: 'kg',
    plantingDate: '2026-02-15T00:00:00.000Z',
    expectedHarvest: '2026-08-15T00:00:00.000Z',
    actualHarvest: null,
    status: 'GROWING',
    createdAt: new Date().toISOString()
  });

  // Seed warehouse
  warehouses.push({
    id: uid(),
    name: 'Central Storage Ibadan',
    location: 'Ibadan, Oyo State',
    capacity: 50000,
    capacityUnit: 'kg',
    managerName: 'Mr. Adebayo',
    contactPhone: '+2348098765432',
    createdAt: new Date().toISOString()
  });

  // Seed transport
  const logUserId = uid();
  users.push({
    id: logUserId,
    email: 'logistics@demo.com',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Fast',
    lastName: 'Track',
    phone: '+2348022223333',
    role: 'LOGISTICS_PROVIDER',
    isVerified: true,
    createdAt: new Date().toISOString()
  });

  const logProfId = uid();
  logisticsProfiles.push({
    id: logProfId,
    userId: logUserId,
    companyName: 'FastTrack Logistics',
    vehicleTypes: ['Truck', 'Van'],
    coverageArea: ['Oyo', 'Lagos', 'Ogun'],
    licenseNumber: 'LOG-2026-001',
    createdAt: new Date().toISOString()
  });

  transports.push({
    id: uid(),
    logisticsId: logProfId,
    vehicleType: 'Truck',
    vehicleNumber: 'LA-1234-XK',
    capacity: 10000,
    capacityUnit: 'kg',
    currentLocation: 'Ibadan',
    isAvailable: true,
    createdAt: new Date().toISOString()
  });

  // Seed buyer
  const buyerUserId = uid();
  users.push({
    id: buyerUserId,
    email: 'buyer@demo.com',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Premium',
    lastName: 'Foods',
    phone: '+2348033334444',
    role: 'BUYER_PROCESSOR',
    isVerified: true,
    createdAt: new Date().toISOString()
  });

  const buyerProfId = uid();
  buyerProfiles.push({
    id: buyerProfId,
    userId: buyerUserId,
    companyName: 'Premium Foods Ltd',
    businessType: 'Food Processor',
    location: 'Lagos, Nigeria',
    licenseNumber: 'BUY-2026-001',
    createdAt: new Date().toISOString()
  });

  // Seed market prices
  marketPrices.push(
    { id: uid(), cropType: 'Maize', marketName: 'Bodija Market', location: 'Ibadan', price: 280, priceUnit: 'per kg', date: new Date().toISOString() },
    { id: uid(), cropType: 'Cassava', marketName: 'Oja Oba', location: 'Ibadan', price: 350, priceUnit: 'per kg', date: new Date().toISOString() },
    { id: uid(), cropType: 'Rice', marketName: 'Mile 12', location: 'Lagos', price: 750, priceUnit: 'per kg', date: new Date().toISOString() },
    { id: uid(), cropType: 'Yam', marketName: 'Zaki Biam', location: 'Benue', price: 450, priceUnit: 'per kg', date: new Date().toISOString() }
  );

  // Seed order
  const orderId = uid();
  distributionOrders.push({
    id: orderId,
    buyerId: buyerProfId,
    transportId: null,
    fromLocation: 'Ibadan, Oyo State',
    toLocation: 'Lagos, Nigeria',
    status: 'PENDING',
    scheduledDate: '2026-06-01T00:00:00.000Z',
    deliveredDate: null,
    trackingNumber: uid().slice(0, 8).toUpperCase(),
    createdAt: new Date().toISOString()
  });

  orderItems.push({
    id: uid(),
    orderId: orderId,
    cropType: 'Maize',
    quantity: 1000,
    unit: 'kg',
    pricePerUnit: 280,
    totalPrice: 280000,
    createdAt: new Date().toISOString()
  });

  console.log('✅ Seed data loaded. In-memory store ready.');
}

module.exports = {
  users, farmerProfiles, supplierProfiles, logisticsProfiles,
  buyerProfiles, governmentProfiles, financialProfiles,
  farms, crops, inputSupplies, qualityChecks,
  warehouses, storageRecords, transports,
  distributionOrders, orderItems, marketListings,
  marketTransactions, marketPrices, payments,
  notifications, chatMessages,
  uid, seedData
};
// Notification helper (moved here to avoid circular dependency)
const userSockets = new Map();

function setSocketMap(map) {
  Object.assign(userSockets, map);
}

function sendNotificationToUser(userId, data) {
  // This will be wired up in server.js
  if (global.ioInstance) {
    global.ioInstance.to(`user_${userId}`).emit('notification', data);
  }
}

module.exports = {
  users, farmerProfiles, supplierProfiles, logisticsProfiles,
  buyerProfiles, governmentProfiles, financialProfiles,
  farms, crops, inputSupplies, qualityChecks,
  warehouses, storageRecords, transports,
  distributionOrders, orderItems, marketListings,
  marketTransactions, marketPrices, payments,
  notifications, chatMessages,
  uid, seedData, sendNotificationToUser, setSocketMap
};