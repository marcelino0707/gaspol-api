const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// Pastikan folder logs ada
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let metaStr = '';
  if (Object.keys(metadata).length > 0) {
    // Remove the error object from metadata to avoid circular references
    const { error, ...restMetadata } = metadata;
    metaStr = Object.keys(restMetadata).length > 0 ? 
      ` | ${JSON.stringify(restMetadata)}` : '';
  }
  
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: 'error', // Hanya mencatat error
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d' // Simpan log selama 7 hari
    }),
    // Optional: Add console logging for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;