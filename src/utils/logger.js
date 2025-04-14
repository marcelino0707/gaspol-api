const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');

class TelegramTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.botToken = "6909601463:AAHnKWEKqlpL1NGRkzRpXVnDgHoVtJtrqo0";
    this.chatIds = [1546898379, 5421340211];
  }

  async log(info, callback) {
    // Proses baik untuk error maupun info
    if (info.level === 'error' || info.level === 'info') {
      try {
        const message = this.formatTelegramMessage(info);
        await this.sendTelegramMessages(message);
      } catch (err) {
        console.error('Failed to send Telegram notification:', err);
      }
    }
  
    callback();
  }

  formatTelegramMessage(info) {
    const isSuccess = info.level === 'info' && info.message.includes('Sync berhasil');
    const isError = info.level === 'error';
    
    // Ambil outlet_id dari metadata atau info
    const outlet_id = info.metadata?.outlet_id || info.outlet_id;
  
    // Untuk error, selalu kirim
    if (isError) {
      return createErrorMessage(info);
    }
  
    // Untuk success, hanya kirim untuk outlet 1
    if (isSuccess && outlet_id !== '1') {
      return null;  // Batalkan pengiriman
    }
    
    // Fungsi terpisah untuk membuat pesan error
    function createErrorMessage(info) {
      let formattedMessage = `🚨 *ERROR ALERT AHONG PANTEQ* 🚨\n\n`;
      
      const { 
        timestamp, 
        message, 
        metadata = {}, 
        stack 
      } = info;
  
      const hostname = os.hostname();
      
      formattedMessage += `*Timestamp:* ${timestamp}\n`;
      formattedMessage += `*Hostname:* ${hostname}\n`;
      
      if (metadata.outlet_id) formattedMessage += `*Outlet ID:* ${metadata.outlet_id}\n`;
      
      formattedMessage += `*Error Message:* ${message}\n`;
      
      if (stack) {
        const truncatedStack = stack.length > 1000 
          ? stack.substring(0, 1000) + '...' 
          : stack;
        formattedMessage += `*Stack Trace:* \`${truncatedStack}\`\n`;
      }
  
      return formattedMessage;
    }
  
    // Lanjutkan dengan format pesan sukses
    let formattedMessage = `✅ *SYNC SUCCESS ALERT AHONG PANTEQ* ✅\n\n`;
  
    const { 
      timestamp, 
      message, 
      metadata = {}, 
    } = info;
  
    const hostname = os.hostname();
    
    formattedMessage += `*Timestamp:* ${timestamp}\n`;
    formattedMessage += `*Hostname:* ${hostname}\n`;
    
    if (metadata.service) formattedMessage += `*Service:* ${metadata.service}\n`;
    if (outlet_id) formattedMessage += `*Outlet ID:* ${outlet_id}\n`;
    
    formattedMessage += `*Message:* ${message}\n`;
    
    const syncDetails = metadata.details || {};
    
    if (syncDetails.totalTransactions !== undefined) {
      formattedMessage += `*Total Transactions:* ${syncDetails.totalTransactions}\n`;
    }
    
    if (syncDetails.receiptNumbers && syncDetails.receiptNumbers.length > 0) {
      formattedMessage += `*Receipt Numbers:*\n`;
      syncDetails.receiptNumbers.forEach((receipt, index) => {
        formattedMessage += `${index + 1}. ${receipt}\n`;
      });
    }
  
    return formattedMessage;
  }
  


  async sendTelegramMessages(message) {
    // Batalkan jika message null
    if (!message) return;
  
    for (const chatId of this.chatIds) {
      try {
        await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`Failed to send message to chat ID ${chatId}:`, error);
      }
    }
  }
}

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ 
      fillExcept: ['message', 'level', 'timestamp', 'stack'] 
    })
  ),
  transports: [
    // Daily rotating file for errors
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.printf(({ timestamp, level, message, stack, service, outlet_id, transaction_ref }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            stack,
            service,
            outlet_id,
            transaction_ref
          });
        })
      )
    }),
    // Daily rotating file for info logs
    new DailyRotateFile({
      filename: path.join(logDirectory, 'sync-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.printf(({ timestamp, level, message, service, outlet_id, transaction_ref }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            service,
            outlet_id,
            transaction_ref
          });
        })
      )
    }),
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
        })
      )
    })
  ]
});

// Add Telegram transport untuk error dan info
logger.add(new TelegramTransport({
  level: 'error'
}));
logger.add(new TelegramTransport({
  level: 'info'
}));

// Enhanced logging methods
logger.errorWithContext = (message, context = {}) => {
  const { service, outlet_id, transaction_ref, additional_info } = context;
  logger.error({
    message,
    service,
    outlet_id,
    transaction_ref,
    additional_info
  });
};

logger.syncSuccess = (context = {}) => {
  const { 
    service = 'OutletTransactionSync', 
    outlet_id, 
    details = {} 
  } = context;

  // Debug log
  console.log('Sync Success Details:', JSON.stringify(details));

  // Pastikan details memiliki properti yang dibutuhkan
  logger.info({
    message: `Sync berhasil untuk outlet ${outlet_id}`,
    service,
    outlet_id,
    details: {
      totalTransactions: details.totalTransactions || 0,
      receiptNumbers: details.receiptNumbers || [],
      transactions: details.transactions || [] // Tambahkan ini jika ada
    }
  });
};

module.exports = logger;