const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const axios = require('axios');
const https = require('https');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Konfigurasi Axios dengan opsi tambahan
const axiosInstance = axios.create({
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

class TelegramTransport extends winston.Transport {
  constructor(opts = {}) {
    super(opts);
    this.name = 'telegram';
    this.level = opts.level || 'info';
    this.botToken = "6909601463:AAHnKWEKqlpL1NGRkzRpXVnDgHoVtJtrqo0";
    this.chatIds = [1546898379, 5421340211];
  }

  log(info, callback) {
    if (info.level !== this.level) {
      callback();
      return;
    }

    // Non-blocking call to send telegram messages
    this.sendTelegramMessages(this.formatMessage(info))
      .then(() => callback())
      .catch((err) => {
        console.error('Telegram transport error (suppressed):', err);
        callback(); // Always call callback to avoid blocking
      });
  }

// Di dalam class TelegramTransport, modifikasi fungsi formatMessage
formatMessage(info) {
  const isSuccess = info.level === 'info' && info.message.includes('Sync berhasil');
  const isError = info.level === 'error';
  const outlet_id = info.metadata?.outlet_id || info.outlet_id;

  // PERUBAHAN: Hanya tampilkan error dan notifikasi sukses untuk outlet 1 dan 4
  if (isError) {
    return this.createErrorMessage(info);
  }

  // Untuk notifikasi sukses, hanya aktifkan untuk outlet 1 dan 4
  if (isSuccess) {
    const enabledOutlets = ['1', '4'];
    if (!enabledOutlets.includes(outlet_id)) {
      return null; // Skip outlet selain 1 dan 4
    }
    return this.createSuccessMessage(info);
  }

  return null;
}

  createSuccessMessage(info) {
    let formattedMessage = `✅ *SYNC SUCCESS ALERT AHONG PANTEQ* ✅\n\n`;
    const { timestamp, message, metadata = {} } = info;
    const outlet_id = metadata.outlet_id || info.outlet_id;

    formattedMessage += `*Timestamp:* ${timestamp}\n`;
    if (metadata.service) formattedMessage += `*Service:* ${metadata.service}\n`;
    if (outlet_id) formattedMessage += `*Outlet ID:* ${outlet_id}\n`;
    formattedMessage += `*Message:* ${message}\n`;

    const syncDetails = metadata.details || {};
    if (syncDetails.totalTransactions !== undefined) {
      formattedMessage += `*Total Transactions:* ${syncDetails.totalTransactions}\n`;
    }

    // Batasi jumlah receipt numbers yang ditampilkan
    if (syncDetails.receiptNumbers && syncDetails.receiptNumbers.length > 0) {
      formattedMessage += `*Receipt Numbers:*\n`;
      // Tampilkan maksimal 3 receipt numbers untuk menghindari pesan terlalu panjang
      const maxReciepts = 3;
      const receiptsToShow = syncDetails.receiptNumbers.slice(0, maxReciepts);
      
      receiptsToShow.forEach((receipt, index) => {
        formattedMessage += `${index + 1}. ${receipt}\n`;
      });
      
      // Tambahkan indikator jika ada lebih banyak receipt
      if (syncDetails.receiptNumbers.length > maxReciepts) {
        formattedMessage += `...dan ${syncDetails.receiptNumbers.length - maxReciepts} lainnya\n`;
      }
    }

    // Batasi panjang pesan keseluruhan
    if (formattedMessage.length > 3000) {
      formattedMessage = formattedMessage.substring(0, 2950) + "...\n[Pesan terpotong karena terlalu panjang]";
    }

    return formattedMessage;
  }

  createErrorMessage(info) {
    let formattedMessage = `🚨 *ERROR ALERT AHONG PANTEQ* 🚨\n\n`;
    const { timestamp, message, metadata = {}, stack } = info;

    formattedMessage += `*Timestamp:* ${timestamp}\n`;
    if (metadata.outlet_id) formattedMessage += `*Outlet ID:* ${metadata.outlet_id}\n`;
    
    // Batasi panjang pesan error
    const maxErrorLength = 300;
    const errorMessage = message.length > maxErrorLength 
      ? message.substring(0, maxErrorLength) + '...' 
      : message;
    
    formattedMessage += `*Error Message:* ${errorMessage}\n`;

    if (stack) {
      const truncatedStack = stack.length > 500
        ? stack.substring(0, 500) + '...'
        : stack;
      formattedMessage += `*Stack Trace:* \`${truncatedStack}\`\n`;
    }

    return formattedMessage;
  }

  async sendTelegramMessages(message) {
    if (!message) return;

    // Make the Telegram notification non-blocking
    Promise.resolve().then(async () => {
      try {
        for (const chatId of this.chatIds) {
          try {
            // Menambahkan timeout yang lebih pendek untuk request Telegram
            await axiosInstance.post(
              `https://api.telegram.org/bot${this.botToken}/sendMessage`, 
              {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
              },
              { timeout: 5000 } // Timeout 5 detik saja
            );
          } catch (error) {
            console.error(`Gagal mengirim pesan ke chat ${chatId}:`, error.message);
            // Hanya log error, tidak throw exception
          }
        }
      } catch (error) {
        console.error('Error saat mengirim notifikasi Telegram:', error);
        // Error ditangkap dan tidak dilempar ke atas
      }
    }).catch(err => {
      console.error('Telegram notification failed but suppressed:', err);
      // Error di-suppress, tidak mempengaruhi proses utama
    });
  }
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
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.printf(({ timestamp, level, message, stack, service, outlet_id, transaction_ref }) => 
        JSON.stringify({ timestamp, level, message, stack, service, outlet_id, transaction_ref })
      )
    }),
    new DailyRotateFile({
      filename: path.join(logDirectory, 'sync-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.printf(({ timestamp, level, message, service, outlet_id, transaction_ref, details }) => 
        JSON.stringify({ timestamp, level, message, service, outlet_id, transaction_ref, details })
      )
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => 
          `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`
        )
      )
    })
  ]
});

// Tambahkan transport Telegram dengan metode yang lebih aman
const telegramErrorTransport = new TelegramTransport({ level: 'error' });
const telegramInfoTransport = new TelegramTransport({ level: 'info' });

logger.add(telegramErrorTransport);
logger.add(telegramInfoTransport);

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

  console.log('Sync Success Details:', JSON.stringify(details));

  try {
    // Batasi data yang dikirim untuk menghindari overload
    const safeDetails = {
      totalTransactions: details.totalTransactions || 0,
      // Batasi jumlah receipt numbers
      receiptNumbers: details.receiptNumbers ? 
        (details.receiptNumbers.length > 5 ? 
          [...details.receiptNumbers.slice(0, 5), `...dan ${details.receiptNumbers.length - 5} lainnya`] : 
          details.receiptNumbers) :
        [],
      // Jangan kirim semua transaction references
      transactions: details.transactions ? 
        [`Total ${details.transactions.length} transaksi`] : 
        []
    };

    // PERUBAHAN: Hanya kirim notifikasi Telegram untuk outlet 1 dan 4
    const enabledOutlets = ['1', '2','3','4','5','6','7','8'];
    if (!enabledOutlets.includes(outlet_id)) {
      // Hanya log ke file tanpa Telegram
      const fileOnlyLogger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.metadata({
            fillExcept: ['message', 'level', 'timestamp']
          })
        ),
        transports: [
          new DailyRotateFile({
            filename: path.join(logDirectory, 'sync-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
            format: winston.format.printf(({ timestamp, level, message, service, outlet_id, transaction_ref, details }) => 
              JSON.stringify({ timestamp, level, message, service, outlet_id, transaction_ref, details })
            )
          }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message }) => 
                `${timestamp} [${level}]: ${message}`
              )
            )
          })
        ]
      });

      fileOnlyLogger.info({
        message: `Sync berhasil untuk outlet ${outlet_id} (telegram notification skipped)`,
        service,
        outlet_id,
        details: safeDetails
      });
    } else {
      // Menggunakan logger normal dengan Telegram untuk outlet 1 dan 4
      logger.info({
        message: `Sync berhasil untuk outlet ${outlet_id}`,
        service,
        outlet_id,
        details: safeDetails
      });
    }
  } catch (error) {
    // Tangkap error logging tapi jangan gagalkan transaksi utama
    console.error('Error dalam syncSuccess logger (suppressed):', error);
  }
};

module.exports = logger;