const crypto = require('crypto');
const logger = require('./logger');

function validateShopifyHMAC(body, hmacHeader, secret) {
  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    const isValid = hash === hmacHeader;

    if (!isValid) {
      logger.warn('HMAC validation failed');
    }

    return isValid;
  } catch (error) {
    logger.error('Error validating HMAC:', error);
    return false;
  }
}

module.exports = { validateShopifyHMAC };