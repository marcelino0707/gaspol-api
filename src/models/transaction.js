const { connectDB, disconnectDB } = require("../utils/dbUtils");
const Transaction = {
  getAllByOutletID: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT transactions.id, transactions.receipt_number, transactions.updated_at, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id LEFT JOIN carts ON transactions.cart_id = carts.id WHERE transactions.outlet_id = " +
              outlet_id +
              " AND transactions.deleted_at IS NULL AND transactions.invoice_due_date IS NULL AND carts.is_canceled = 0",
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.invoice_due_date, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.outlet_id = " +
              outlet_id +
              " AND DATE(transactions.updated_at) = '" +
              date +
              "' AND transactions.invoice_due_date IS NOT NULL AND transactions.deleted_at IS NULL ORDER BY transactions.invoice_due_date DESC",
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
            "SELECT transactions.id, transactions.receipt_number, refunds.is_refund_all AS is_refunded, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, transactions.invoice_due_date, transactions.updated_at FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id LEFT JOIN refunds ON transactions.id = refunds.transaction_id WHERE transactions.id = ? AND transactions.deleted_at IS NULL",
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
  getSavedBillByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id FROM transactions WHERE cart_id = ? AND deleted_at IS NULL",
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
            "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, refunds.is_refund_all AS is_refunded, carts.total, carts.is_canceled, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, transactions.payment_type_id, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, DATE_FORMAT(transactions.invoice_due_date, '%Y-%m-%d %H:%i:%s') as invoice_due_date, DATE_FORMAT(transactions.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at FROM transactions JOIN carts ON transactions.cart_id = carts.id LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id LEFT JOIN refunds ON transactions.id = refunds.transaction_id WHERE transactions.outlet_id = ? AND transactions.deleted_at IS NULL";
          if (
            (start_date != undefined || start_date != null) &&
            (end_date != undefined || end_date != null)
          ) {
            query += " AND DATE(transactions.updated_at) BETWEEN ? AND ?";
          }

          if (is_success == "true") {
            query += " AND transactions.invoice_due_date IS NOT NULL";
          }

          if (is_pending == "true") {
            query += " AND transactions.invoice_due_date IS NULL";
          }

          query += " ORDER BY transactions.updated_at DESC";

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
            "SELECT transactions.id AS transaction_id, transactions.discount_name AS transaction_discount_code, carts.discount_id, carts.id AS cart_id, carts.subtotal, transactions.invoice_number, payment_types.name AS payment_type, payment_categories.name AS payment_category, carts.total, refunds.id AS refund_id, refunds.is_refund_type_all AS is_refund_type_all, refunds.payment_type_id_all AS payment_type_id_all, refunds.total_refund AS total_refund, DATE_FORMAT(refunds.updated_at, '%Y-%m-%d %H:%i:%s') AS refund_updated_at, DATE_FORMAT(transactions.invoice_due_date, '%Y-%m-%d %H:%i:%s') AS invoice_due_date FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id JOIN carts ON transactions.cart_id = carts.id LEFT JOIN discounts ON carts.discount_id = discounts.id LEFT JOIN refunds ON transactions.id = refunds.transaction_id WHERE transactions.deleted_at IS NULL AND transactions.invoice_number IS NOT NULL AND transactions.outlet_id = ? AND transactions.invoice_due_date BETWEEN ? AND ? ORDER BY transactions.invoice_due_date DESC";
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
  haveSuccessTransactions: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query =
            "SELECT id FROM transactions WHERE deleted_at IS NULL AND invoice_number IS NOT NULL AND outlet_id = ? AND updated_at BETWEEN ? AND ? LIMIT 1";
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
          const query =
            "SELECT transactions.id AS transaction_id, carts.id AS cart_id, carts.is_canceled, transactions.invoice_number, transactions.payment_type_id, payment_types.payment_category_id AS payment_category_id, carts.total, carts.subtotal, carts.discount_id FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id JOIN carts ON transactions.cart_id = carts.id WHERE transactions.deleted_at IS NULL AND transactions.outlet_id = ? AND ((transactions.invoice_number IS NOT NULL AND transactions.invoice_due_date BETWEEN ? AND ?) OR (transactions.invoice_number IS NULL AND transactions.updated_at BETWEEN ? AND ?))";
          connection.query(
            query,
            [outlet_id, start_date, end_date, start_date, end_date],
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
