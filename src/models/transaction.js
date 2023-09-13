const { connectDB, disconnectDB } = require("../utils/dbUtils");
const today = new Date().toISOString().slice(0, 10);
const Transaction = {
  getAllByOutletID: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = ? AND deleted_at IS NULL AND invoice_due_date IS NULL", [outlet_id, today],
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
  getAllByIsSuccess: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note FROM transactions WHERE outlet_id = ? AND deleted_at IS NULL AND invoice_due_date IS NOT NULL",
            [outlet_id, today],
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
          connection.query("SELECT id, receipt_number, outlet_id, cart_id, customer_name, customer_seat, customer_cash, customer_change, invoice_number, invoice_due_date FROM transactions WHERE id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  getByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id FROM transactions WHERE cart_id = ? AND deleted_at IS NULL", cart_id, (error, results) => {
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
  getAllReport: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, receipt_number, customer_name, customer_seat, customer_cash, customer_change, payment_type, delivery_type, delivery_note, invoice_number, invoice_due_date FROM transactions WHERE outlet_id = ? AND deleted_at IS NULL AND invoice_due_date IS NOT NULL AND invoice_due_date BETWEEN ? AND ?",
            [outlet_id, start_date, end_date],
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
