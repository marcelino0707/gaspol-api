const winston = require('winston');
const TelegramTransport = require('winston-telegram').Telegram;
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// Telegram configuration
const telegramConfig = {
  token: "6909601463:AAHnKWEKqlpL1NGRkzRpXVnDgHoVtJtrqo0",
  chatIds: [1546898379, 5421340211]
};

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a formatter that will handle metadata properly for different outputs
const fileLogFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    const { error, ...restMetadata } = metadata;
    metaStr = Object.keys(restMetadata).length > 0 ? 
      ` | ${JSON.stringify(restMetadata)}` : '';
  }
  
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
});

// Create a formatter specifically for Telegram messages
const telegramLogFormat = winston.format.printf(({ level, message, ...metadata }) => {
  const { outlet_id, cart_id, transaction_id, function: func, model, error } = metadata;
  
  let telegramMsg = `🔴 *ERROR API* 🔴\n\n`;
  telegramMsg += `*Message:* ${message}\n`;
  
  if (func) telegramMsg += `*Function:* ${func}\n`;
  if (model) telegramMsg += `*Model:* ${model}\n`;
  if (outlet_id) telegramMsg += `*Outlet:* ${outlet_id}\n`;
  if (cart_id) telegramMsg += `*Cart:* ${cart_id}\n`;
  if (transaction_id) telegramMsg += `*Transaction:* ${transaction_id}\n`;
  
  if (error && error.stack) {
    const shortStack = error.stack.split('\n').slice(0, 3).join('\n');
    telegramMsg += `\n*Stack:*\n\`\`\`\n${shortStack}\n\`\`\``;
  }
  
  return telegramMsg;
});

// Create base logger
const logger = winston.createLogger({
  level: 'error',
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
      maxFiles: '7d',
      format: winston.format.combine(fileLogFormat)
    }),
    
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Telegram transports for each chat ID
    ...telegramConfig.chatIds.map(chatId => 
      new TelegramTransport({
        token: telegramConfig.token,
        chatId: chatId,
        level: 'error',
        format: winston.format.combine(
          winston.format.printf(info => {
            return telegramLogFormat.transform(info);
          })
        ),
        disableNotification: false,
        parseMode: 'Markdown'
      })
    )
  ]
});

// Enhanced error logging method
const originalError = logger.error.bind(logger);
logger.error = function(message, metadata = {}) {
  originalError(message, metadata);
};

// Critical error method
logger.critical = function(message, metadata) {
  this.error(message, { 
    ...metadata, 
    critical: true
  });
};

module.exports = logger;