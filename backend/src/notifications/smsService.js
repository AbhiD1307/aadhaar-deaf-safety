const logger = require('../utils/logger');

let twilioClient = null;

function getTwilio() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

async function sendSMS(to, message) {
  const client = getTwilio();
  if (!client) {
    logger.warn(`[SMS MOCK] To: ${to}\n${message}`);
    return { mock: true };
  }
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
  logger.info(`SMS sent to ${to}: ${result.sid}`);
  return result;
}

module.exports = { sendSMS };
