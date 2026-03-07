const { io } = require('socket.io-client');

// 🔐 KListra in din riktiga JWT-token här:
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('Missing TOKEN');
  process.exit(1);
}

const socket = io('http://localhost:3000', {
  auth: {
    token: TOKEN,
  },
});

socket.on('connect', () => {
  console.log('✅ Connected to socket server');
});

socket.on('connected', (data) => {
  console.log('🤝 Server handshake:', data);
});

socket.on('booking.created', (data) => {
  console.log('🟢 BOOKING CREATED:', JSON.stringify(data, null, 2));
});

socket.on('booking.updated', (data) => {
  console.log('🟡 BOOKING UPDATED:', JSON.stringify(data, null, 2));
});

socket.on('booking.deleted', (data) => {
  console.log('🔴 BOOKING DELETED:', JSON.stringify(data, null, 2));
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

socket.on('connect_error', (err) => {
  console.error('🚨 Connection error:', err.message);
});