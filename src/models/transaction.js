const { connectDB, disconnectDB } = require("../utils/dbUtils");
const Transaction = {
  getAllByOutletID: (outlet_id, date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = " + outlet_id + " AND DATE(created_at) = '" + date + "' AND deleted_at IS NULL AND invoice_due_date IS NULL",
            (error, results) => {
              disconnectDB(connection);
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
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = " + outlet_id + " AND DATE(updated_at) = '" + date + "' AND invoice_due_date IS NOT NULL AND deleted_at IS NULL",
            (error, results) => {
              disconnectDB(connection);
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
              disconnectDB(connection);
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
              disconnectDB(connection);
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
              disconnectDB(connection);
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
              disconnectDB(connection);
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
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note, invoice_number, DATE_FORMAT(invoice_due_date, '%Y-%m-%d %H:%i') as invoice_due_date, DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updated_at FROM transactions WHERE outlet_id = ? AND deleted_at IS NULL";
          if (
            (start_date != undefined || start_date != null) &&
            (end_date != undefined || end_date != null)
          ) {
            query += " AND DATE(created_at) BETWEEN ? AND ?";
          }

          if (is_success == "true") {
            query += " AND invoice_due_date IS NOT NULL";
          }

          if (is_pending == "true") {
            query += " AND invoice_due_date IS NULL";
          }
          
          connection.query(
            query,
            [outlet_id, start_date, end_date, is_success, is_pending],
            (error, results) => {
              disconnectDB(connection);
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
  getByAllPaymentReport: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = "SELECT transactions.id AS transaction_id, carts.id AS cart_id, transactions.invoice_number, transactions.payment_type, carts.total, (SELECT refunds.id FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1 ) AS refund_id, (SELECT refunds.total_refund FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1 ) AS total_refund, ( SELECT DATE_FORMAT(refunds.updated_at, '%Y-%m-%d %H:%i') FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1) AS refund_updated_at FROM transactions JOIN carts ON transactions.cart_id = carts.id WHERE transactions.deleted_at IS NULL AND transactions.invoice_number IS NOT NULL AND transactions.outlet_id = ? AND DATE(transactions.updated_at) BETWEEN ? AND ?"
          connection.query(
            query,
            [outlet_id, start_date, end_date], (error, results) => {
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

module.exports = Transaction;
