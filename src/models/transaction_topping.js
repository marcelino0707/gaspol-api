const { connectDB, disconnectDB } = require("../utils/dbUtils");

const TransactionTopping = {
  getAllByTransactionDetailID: (transaction_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT menu_id, serving_type_id, total_item FROM transaction_toppings WHERE transaction_detail_id = ? AND deleted_at IS NULL", transaction_detail_id, (error, results) => {
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
  create: (transaction_topping) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO transaction_toppings SET ?", transaction_topping, (error, results) => {
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
  delete: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE transaction_toppings SET ? WHERE transaction_id = ?", [data, id], (error, results) => {
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

module.exports = TransactionTopping;
