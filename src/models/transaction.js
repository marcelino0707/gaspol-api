const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Transaction = {
    getAll: () => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
              connection.query('SELECT id, receipt_number, customer_name, customer_seat, customer_cash, customer_change, subtotal, total, payment_type, delivery_type, delivery_note, invoice_number, invoice_due_date, refund_reason FROM transactions', (error, results) => {
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
    create: (transaction) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            connection.query('INSERT INTO transactions SET ?', transaction, (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results);
                // const insertedTransactionId = results.insertId;
                // connection.query('SELECT id, customer_name, customer_seat, subtotal, total FROM transactions WHERE id = ?', insertedTransactionId, (error, results) => {
                    // disconnectDB();
                    // if (error) {
                        // reject(error);
                    // } else {
                        // resolve(results[0]);
                    // }
                // });
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
              connection.query('UPDATE transactions SET ? WHERE id = ?', [transaction, id],  (error, results) => {
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
}

module.exports = Transaction;