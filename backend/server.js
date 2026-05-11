require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { seedData } = require('./data/store');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// In-memory socket mapping
const userSockets = new Map();

function sendNotificationToUser(userId, data) {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', data);
  }
}

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Socket.io
io.on('connection', (socket) => {
  socket.on('join', () => {
    // Token should be sent in auth during handshake
    const token = socket.handshake.auth?.token;
    if (token) {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('./middleware/auth');
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userSockets.set(decoded.userId, socket.id);
        socket.join(`user_${decoded.userId}`);
      } catch (e) {}
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/storage', require('./routes/storage'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/market', require('./routes/market'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Seed and start
seedData();

// Make io available globally for notifications
global.ioInstance = io;

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time notifications`);
  console.log(`💾 In-memory store active (no database required)`);
});

// Export for routes
module.exports = { io };