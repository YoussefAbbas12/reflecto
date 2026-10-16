const axios = require('axios');

/**
 * Normalizes phone numbers for Taqnyat SMS API.
 * Converts 05XXXXXXXX or +9665XXXXXXXX or 5XXXXXXXX to 9665XXXXXXXX
 * @param {string} phone 
 * @returns {string} normalized phone number
 */
function normalizePhoneForTaqnyat(phone) {
  if (!phone) return '';
  let cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('05')) {
    cleaned = '966' + cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '966' + cleaned;
  }
  
  return cleaned;
}

/**
 * Sends an SMS message using Taqnyat SMS API (https://dev.taqnyat.sa/en/doc/sms/)
 * 
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message text content
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function sendSMS(phone, message) {
  const bearerToken = process.env.TAQNYAT_BEARER_TOKEN;
  const sender = process.env.TAQNYAT_SENDER;

  if (!bearerToken) {
    console.warn('⚠️ Taqnyat SMS: TAQNYAT_BEARER_TOKEN is not configured in .env');
    return { success: false, error: 'SMS service not configured' };
  }

  const recipient = normalizePhoneForTaqnyat(phone);

  try {
    const payload = {
      recipients: [recipient],
      body: message
    };

    if (sender && sender.trim()) {
      payload.sender = sender.trim();
    }

    const response = await axios.post('https://api.taqnyat.sa/v1/messages', payload, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`📱 Taqnyat SMS sent to ${recipient}. Response:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error('❌ Taqnyat SMS Error:', errorDetails);
    return { success: false, error: errorDetails };
  }
}

module.exports = {
  sendSMS,
  normalizePhoneForTaqnyat
};
