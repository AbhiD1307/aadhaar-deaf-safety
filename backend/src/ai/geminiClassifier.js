const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

let genAI = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// Rule-based fallback when Gemini is unavailable
function ruleBasedClassify(data) {
  const type = (data.type || '').toLowerCase();
  const value = data.value;

  const highRiskTypes = ['fire_alarm', 'co_alarm', 'glass_break', 'intruder', 'sos'];
  const mediumRiskTypes = ['motion', 'doorbell', 'smoke', 'gas_leak'];

  if (highRiskTypes.includes(type)) {
    return { eventType: type, riskLevel: 'high', confidence: 0.95, summary: `${type} detected`, actions: ['flash_lights', 'vibrate', 'notify_contacts', 'full_screen_alert'] };
  }
  if (mediumRiskTypes.includes(type)) {
    return { eventType: type, riskLevel: 'medium', confidence: 0.85, summary: `${type} detected`, actions: ['vibrate', 'notification'] };
  }
  if (type === 'co_level' && value > 50) {
    return { eventType: 'co_alarm', riskLevel: 'high', confidence: 0.92, summary: `CO level critical: ${value} ppm`, actions: ['flash_lights', 'vibrate', 'notify_contacts', 'full_screen_alert'] };
  }
  return { eventType: type || 'unknown', riskLevel: 'low', confidence: 0.7, summary: 'Normal sensor reading', actions: ['log'] };
}

async function classifyEvent(sensorData) {
  const ai = getGenAI();

  if (!ai) {
    logger.warn('Gemini API key not set — using rule-based classifier');
    return ruleBasedClassify(sensorData);
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an emergency event classifier for the Aadhar safety system serving deaf and hard-of-hearing users.

Sensor data received:
${JSON.stringify(sensorData, null, 2)}

Classify this event and respond with ONLY valid JSON in this exact format:
{
  "eventType": "fire_alarm|co_alarm|motion|doorbell|glass_break|baby_cry|intruder|normal",
  "riskLevel": "high|medium|low",
  "confidence": 0.0-1.0,
  "summary": "one line human-readable description",
  "actions": ["flash_lights", "vibrate", "full_screen_alert", "notify_contacts", "log"]
}

Risk level guide:
- high: immediate danger to life (fire, CO, intruder, glass break)
- medium: attention needed (motion, doorbell, smoke trace)
- low: normal/ambient reading

Only include actions appropriate for the risk level.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const classification = JSON.parse(jsonMatch[0]);
    logger.info(`Gemini classified: ${classification.eventType} (${classification.riskLevel})`);
    return classification;

  } catch (err) {
    logger.error(`Gemini classification failed: ${err.message} — falling back to rules`);
    return ruleBasedClassify(sensorData);
  }
}

module.exports = { classifyEvent };
