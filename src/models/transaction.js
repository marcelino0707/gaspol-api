const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Transaction = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, customer_name, customer_seat, customer_cash, customer_change, subtotal, total, payment_type, delivery_type, delivery_note FROM transactions WHERE deleted_at IS NULL AND invoice_due_date IS NULL",
            (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, receipt_number, customer_name, customer_seat, customer_cash, customer_change, subtotal, total FROM transactions WHERE id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  create: (transaction) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO transactions SET ?", transaction, (error, results) => {
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
  update: (id, transaction) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE transactions SET ? WHERE id = ?", [transaction, id], (error, results) => {
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
          connection.query("UPDATE transactions SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = Transaction;
