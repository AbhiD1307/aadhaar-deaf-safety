require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const { startMqttBroker } = require('./mqtt/broker');
const { setupMqttClient } = require('./mqtt/client');
const { setupSocketIO } = require('./websocket/socketHandler');
const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const deviceRoutes = require('./routes/devices');
const sosRoutes = require('./routes/sos');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'aadhar-backend' }));

// Setup WebSocket handlers
setupSocketIO(io);

// Start MQTT broker and client
const PORT = process.env.PORT || 3000;
const MQTT_PORT = parseInt(process.env.MQTT_BROKER_PORT) || 1883;

server.listen(PORT, async () => {
  logger.info(`Aadhar backend running on port ${PORT}`);
  try {
    await startMqttBroker(MQTT_PORT);
    logger.info(`MQTT broker running on port ${MQTT_PORT}`);
    setupMqttClient(io);
  } catch (err) {
    logger.error('MQTT startup error:', err.message);
  }
});

module.exports = { app, server, io };
