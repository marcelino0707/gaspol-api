const { connectDB, disconnectDB } = require("../utils/dbUtils");
const Transaction = {
  getAllByOutletID: (outlet_id, date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id LEFT JOIN carts ON transactions.cart_id = carts.id WHERE transactions.outlet_id = " +
              outlet_id +
              " AND DATE(transactions.created_at) = '" +
              date +
              "' AND transactions.deleted_at IS NULL AND transactions.invoice_due_date IS NULL AND carts.is_canceled = 0",
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.outlet_id = " +
              outlet_id +
              " AND DATE(transactions.updated_at) = '" +
              date +
              "' AND transactions.invoice_due_date IS NOT NULL AND transactions.is_refunded = 0 AND transactions.deleted_at IS NULL",
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, transactions.invoice_due_date FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.id = ? AND transactions.deleted_at IS NULL",
            [id],
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, transactions.invoice_due_date, payment_types.name AS payment_type, payment_categories.name AS payment_category FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.cart_id = ? AND transactions.deleted_at IS NULL",
            [cart_id],
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, DATE_FORMAT(transactions.invoice_due_date, '%Y-%m-%d %H:%i') as invoice_due_date, DATE_FORMAT(transactions.updated_at, '%Y-%m-%d %H:%i') as updated_at FROM transactions WHERE transactions.outlet_id = ? AND transactions.deleted_at IS NULL";
          if (
            (start_date != undefined || start_date != null) &&
            (end_date != undefined || end_date != null)
          ) {
            query += " AND DATE(transactions.created_at) BETWEEN ? AND ?";
          }

          if (is_success == "true") {
            query += " AND transactions.invoice_due_date IS NOT NULL";
          }

          if (is_pending == "true") {
            query += " AND transactions.invoice_due_date IS NULL";
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
          const query =
            "SELECT transactions.id AS transaction_id, carts.id AS cart_id, carts.subtotal, transactions.invoice_number, payment_types.name AS payment_type, payment_categories.name AS payment_category, carts.total, discounts.code AS discount_code, discounts.is_percent AS discounts_is_percent,  discounts.max_discount AS max_discount, discounts.value AS discounts_value, (SELECT refunds.id FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1 ) AS refund_id, (SELECT refunds.total_refund FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1 ) AS total_refund, ( SELECT DATE_FORMAT(refunds.updated_at, '%Y-%m-%d %H:%i') FROM refunds WHERE refunds.transaction_id = transactions.id LIMIT 1) AS refund_updated_at FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id JOIN carts ON transactions.cart_id = carts.id LEFT JOIN discounts ON carts.discount_id = discounts.id WHERE transactions.deleted_at IS NULL AND transactions.invoice_number IS NOT NULL AND transactions.outlet_id = ? AND DATE(transactions.updated_at) BETWEEN ? AND ?";
          connection.query(
            query,
            [outlet_id, start_date, end_date],
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
  getShiftReport: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          let query =
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, DATE_FORMAT(transactions.invoice_due_date, '%Y-%m-%d %H:%i') as invoice_due_date, DATE_FORMAT(transactions.updated_at, '%Y-%m-%d %H:%i') as updated_at FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.outlet_id = ? AND transactions.deleted_at IS NULL";

          if (start_date && end_date) {
            query += " AND transactions.invoice_due_date BETWEEN ? AND ?";
          }

          connection.query(
            query,
            [outlet_id, start_date, end_date],
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
};

module.exports = Transaction;
