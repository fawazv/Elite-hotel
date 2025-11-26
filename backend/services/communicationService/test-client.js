const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Mock a valid token (assuming you have a way to generate one or use a hardcoded secret for testing)
// In a real scenario, you'd get this from the auth service.
// For this test, we need the SAME secret as in the .env file.
const SECRET = 'your_super_secret_key_123'; // REPLACE THIS WITH YOUR ACTUAL ENV SECRET IF DIFFERENT
const token = jwt.sign({ id: 'test-user-1', email: 'test@example.com' }, SECRET, { expiresIn: '1h' });

const socket = io('http://localhost:3008', {
  auth: {
    token: token
  }
});

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);

  // Test AI Chat
  console.log('Sending AI chat message...');
  socket.emit('ai-chat-message', 'Hello, I want to book a room');

  // Test Room Join
  socket.emit('join-room', 'room-123');
});

socket.on('ai-chat-response', (response) => {
  console.log('Received AI response:', response);
});

socket.on('connect_error', (err) => {
  console.log('Connection Error:', err.message);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

// Keep alive for a bit
setTimeout(() => {
  socket.close();
}, 5000);
