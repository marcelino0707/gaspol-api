const { connectDB, disconnectDB } = require("../utils/dbUtils");
const Transaction = {
  getAllByOutletID: (outlet_id, date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = ? AND DATE(created_at) = ? AND deleted_at IS NULL AND invoice_due_date IS NULL",
            [outlet_id, date],
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
  getAllByIsSuccess: (outlet_id, date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = ? AND DATE(invoice_due_date) = ? AND deleted_at IS NULL AND invoice_due_date IS NOT NULL",
            [outlet_id, date],
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
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note, invoice_number, invoice_due_date FROM transactions WHERE id = ? AND deleted_at IS NULL",
            id,
            (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results[0]);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
  getByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note, invoice_number, invoice_due_date FROM transactions WHERE cart_id = ? AND deleted_at IS NULL",
            cart_id,
            (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results[0]);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
  create: (transaction) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "INSERT INTO transactions SET ?",
            transaction,
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
  update: (id, transaction) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE transactions SET ? WHERE id = ?",
            [transaction, id],
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
  getAllReport: (outlet_id, start_date, end_date, is_success, is_pending) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          let query =
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note, invoice_number, invoice_due_date FROM transactions WHERE outlet_id = ? AND deleted_at IS NULL";
          if (
            (start_date != undefined || start_date != null) &&
            (end_date != undefined || end_date != null)
          ) {
            query += " AND DATE(created_at) BETWEEN ? AND ?";
          }

          if (is_success != undefined || is_success != null || is_success == true) {
            query += " AND invoice_due_date IS NOT NULL";
          }

          if (is_pending != undefined || is_pending != null || is_pending == true) {
            query += " AND invoice_due_date IS NULL";
          }

          connection.query(
            query,
            [outlet_id, start_date, end_date, is_success, is_pending],
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
};

module.exports = Transaction;
