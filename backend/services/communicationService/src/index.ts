import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now, restrict in production
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'communicationService' });
});

const PORT = process.env.PORT || 3008; // Assigning a new port for this service

server.listen(PORT, () => {
  console.log(`Communication Service running on port ${PORT}`);
});
