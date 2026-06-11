const logger = require('../utils/logger');
const { getAlerts, dismissAlert } = require('../store/alertStore');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // Send recent alerts on connect
    socket.emit('alerts_history', getAlerts({ limit: 20 }));

    socket.on('dismiss_alert', ({ alertId }) => {
      const alert = dismissAlert(alertId);
      if (alert) io.emit('alert_dismissed', { alertId });
    });

    socket.on('sos_triggered', (data) => {
      logger.info(`SOS triggered by ${socket.id}: ${JSON.stringify(data)}`);
      io.emit('sos_active', { ...data, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketIO };
