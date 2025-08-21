const { connectDB, disconnectDB } = require('../utils/dbUtils');

const LogWindowsClient = {
  create: (logData) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = `
            INSERT INTO app_desktop_client_logs (outlet_id, outlet_name, log_code, log_level, message, exception, source, additional_info) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          connection.query(query, [
            logData.outlet_id,
            logData.outlet_name,
            logData.log_code,
            logData.log_level,
            logData.message,
            logData.exception,
            logData.source,
            logData.additional_info,
          ], (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = 'SELECT * FROM app_desktop_client_logs ORDER BY created_at DESC';
          connection.query(query, (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results || null);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },
  getByOutletId: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = 'SELECT * FROM app_desktop_client_logs WHERE outlet_id = ? ORDER BY created_at DESC';
          connection.query(query, [outletId], (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results || null);
            }
          });
        })
        .catch((error) => reject(error));
    });
  }
};

module.exports = LogWindowsClient;