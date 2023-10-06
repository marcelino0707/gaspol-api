require('dotenv').config();
const mysql = require('mysql2');

let connection = null;

const connectDB = () => {
  return new Promise((resolve, reject) => {
    if (connection) {
      resolve();
    } else {
      connection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      connection.getConnection((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(connection);
        }
      });
    }
  });
};

const disconnectDB = () => {
  return new Promise((resolve, reject) => {
    if (connection) {
      connection.end((error) => {
        if (error) {
          reject(error);
        } else {
          connection = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  connectDB,
  disconnectDB,
};