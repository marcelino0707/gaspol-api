const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Refund = {
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, transaction_id, is_refund_all, refund_reason, total_refund FROM refunds WHERE id = ?", id, (error, results) => {
            disconnectDB(connection);
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
  getByTransactionId: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT refunds.id, refunds.is_refund_all, refunds.refund_reason, refunds.total_refund, payment_types.name AS refund_payment_type_all_name FROM refunds LEFT JOIN payment_types ON refunds.payment_type_id_all = payment_types.id WHERE refunds.transaction_id = ?", id, (error, results) => {
            disconnectDB(connection);
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
  getByTransactionIds: (transactionIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, is_refund_all FROM refunds WHERE transaction_id IN (?)",
            [transactionIdS],
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
            "SELECT refunds.id, refunds.transaction_id, refunds.total_refund, carts.subtotal AS subtotal_cart, carts.discount_id, refunds.payment_type_id_all AS payment_type_id FROM refunds LEFT JOIN transactions ON refunds.transaction_id = transactions.id LEFT JOIN carts ON transactions.cart_id = carts.id WHERE refunds.is_refund_type_all = 1 AND transactions.outlet_id = ? AND refunds.created_at BETWEEN ? AND ?";
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
  haveRefunds: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query =
            "SELECT refunds.id FROM refunds JOIN transactions ON refunds.transaction_id = transactions.id WHERE transactions.outlet_id = ? AND refunds.updated_at BETWEEN ? AND ?";
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
  create: (refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO refunds SET ?", refund, (error, results) => {
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
  update: (id, refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE refunds SET ? WHERE id = ?", [refund, id], (error, results) => {
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

module.exports = Refund;
