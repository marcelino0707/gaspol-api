require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // This option ensures that new queries will wait for a connection if there are no connections available in the pool.
  connectionLimit: 200, // Adjust the connection limit as needed.
  queueLimit: 0, // No limit for the number of queued queries.
});

const connectDB = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    });
  });
};

const disconnectDB = (connection) => {
  if (connection) {
    connection.release(); // Release the connection back to the pool.
  } else {
    console.warn("Connection is undefined; it may have already been released or was not properly created.");
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};