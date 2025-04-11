const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');
// Import winston-telegram correctly
require('winston-telegram');

// Telegram configuration
const telegramConfig = {
  token: "6909601463:AAHnKWEKqlpL1NGRkzRpXVnDgHoVtJtrqo0",
  chatIds: [1546898379, 5421340211]
};

// Pastikan folder logs ada
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a formatter that will handle metadata properly for different outputs
const fileLogFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    // Remove the error object from metadata to avoid circular references
    const { error, ...restMetadata } = metadata;
    metaStr = Object.keys(restMetadata).length > 0 ? 
      ` | ${JSON.stringify(restMetadata)}` : '';
  }
  
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
});

// Create a formatter specifically for Telegram messages (more compact)
const telegramLogFormat = winston.format.printf(({ level, message, ...metadata }) => {
  // Extract relevant information for a concise Telegram message
  const { outlet_id, cart_id, transaction_id, function: func, model, error } = metadata;
  
  // Build a more readable message for Telegram
  let telegramMsg = `🔴 *ERROR API AHONG KONTOL* 🔴\n\n`;
  telegramMsg += `*Message:* ${message}\n`;
  
  if (func) telegramMsg += `*Function:* ${func}\n`;
  if (model) telegramMsg += `*Model:* ${model}\n`;
  if (outlet_id) telegramMsg += `*Outlet:* ${outlet_id}\n`;
  if (cart_id) telegramMsg += `*Cart:* ${cart_id}\n`;
  if (transaction_id) telegramMsg += `*Transaction:* ${transaction_id}\n`;
  
  // Add stack trace if available
  if (error && error.stack) {
    const shortStack = error.stack.split('\n').slice(0, 3).join('\n');
    telegramMsg += `\n*Stack:*\n\`\`\`\n${shortStack}\n\`\`\``;
  }
  
  return telegramMsg;
});

// Buat instance logger dasar tanpa transport Telegram dulu
const baseLogger = winston.createLogger({
  level: 'error', // Hanya mencatat error
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Local file transport
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d', // Simpan log selama 7 hari
      format: winston.format.combine(fileLogFormat)
    }),
    
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create loggers without Telegram transport for now - we'll add them manually
const logger = baseLogger;

// Handle Telegram logging separately to avoid winston.transports.Telegram errors
function sendToTelegram(message, metadata = {}) {
  try {
    // This is a safer way to handle Telegram logging that won't crash the application
    // if there are issues with the Telegram transport
    
    // Format telegram message
    const formattedMessage = telegramLogFormat.transform({
      level: 'error',
      message,
      ...metadata
    });

    // We could implement a safe way to send to Telegram here
    // For example, using the Telegram Bot API directly with axios/fetch
    // But for now, we'll just log that we would send to Telegram
    console.log(`[TELEGRAM MESSAGE WOULD BE SENT]: ${formattedMessage}`);
    
    // When you're ready to properly implement Telegram logging,
    // you can uncomment and fix this code:
    /*
    for (const chatId of telegramConfig.chatIds) {
      // Use a direct HTTP request to send the message to Telegram
      // This avoids using winston.transports.Telegram which is causing issues
    }
    */
  } catch (err) {
    // If Telegram logging fails, we don't want it to crash the app
    console.error('Error sending to Telegram:', err);
  }
}

// Override error method to attempt to send to Telegram without crashing the app
const originalError = baseLogger.error.bind(baseLogger);
logger.error = function(message, metadata = {}) {
  // Log to file and console using logger dasar
  originalError(message, metadata);
  
  // Try to send to Telegram without crashing if it fails
  sendToTelegram(message, metadata);
};

// Add a helper to send critical errors with higher priority
logger.critical = function(message, metadata) {
  this.error(message, { 
    ...metadata, 
    critical: true
  });
};

module.exports = logger;