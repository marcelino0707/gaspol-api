const { connectDB, disconnectDB } = require("../utils/dbUtils");

const TransactionDetail = {
  getAllByTransactionID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id AS transaction_detail_id, menu_id, menu_varian_id, serving_type_id, total_item, note_item FROM transaction_details WHERE transaction_id = ?", id, (error, results) => {
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
  create: (transaction_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO transaction_details SET ?", transaction_detail, (error, results) => {
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

module.exports = TransactionDetail;
