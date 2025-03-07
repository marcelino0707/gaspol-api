const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Complaint = {
    getAllByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT name, title, message, sent_at, log_last_outlet, cache_transaction, cache_failed_transaction, cache_success_transaction, cache_history_transaction FROM outlet_complaints WHERE outlet_id = ? ORDER BY sent_at DESC LIMIT 20', outlet_id, (error, results) => {
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
  create: (complaint) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO outlet_complaints SET ?", complaint, (error, results) => {
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
};

module.exports = Complaint;