const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Refund = {
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, transaction_id, is_refund_all, refund_reason FROM refunds WHERE transaction_id = ?", id, (error, results) => {
            disconnectDB();
            if (error) {
              reject(error);
            } else {
              resolve(results[0]);
            }
          });
        })
        .catch((error) => reject(error));
    });
  },
  create: (refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO refunds SET ?", refund, (error, results) => {
            disconnectDB();
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

module.exports = Refund;
