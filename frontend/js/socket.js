// ===== SOCKET.IO CLIENT =====
let socket = null;

function connectSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // Using Socket.IO CDN in HTML
  if (typeof io === 'undefined') {
    console.warn('Socket.IO not loaded');
    return null;
  }

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('join');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('notification', (data) => {
    // Update notification badge
    updateNotificationBadge();
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, { body: data.message });
    }
  });

  return socket;
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function onNotification(callback) {
  if (socket) {
    socket.on('notification', callback);
  }
}

window.Socket = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  onNotification
};