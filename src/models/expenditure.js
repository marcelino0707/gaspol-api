const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Expenditure = {
  // getExpense: (outlet_id, start_date, end_date) => {
  //   return new Promise((resolve, reject) => {
  //     connectDB()
  //       .then((connection) => {
  //         let query =
  //           "SELECT transactions.id, transactions.receipt_number, transactions.outlet_id, transactions.cart_id, transactions.customer_name, transactions.customer_seat, transactions.customer_cash, transactions.customer_change, payment_types.name AS payment_type, payment_categories.name AS payment_category, transactions.delivery_type, transactions.delivery_note, transactions.invoice_number, DATE_FORMAT(transactions.invoice_due_date, '%Y-%m-%d %H:%i') as invoice_due_date, DATE_FORMAT(transactions.updated_at, '%Y-%m-%d %H:%i') as updated_at FROM transactions LEFT JOIN payment_types ON transactions.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE transactions.outlet_id = ? AND transactions.deleted_at IS NULL";

  //         if (start_date && end_date) {
  //           query += " AND transactions.invoice_due_date BETWEEN ? AND ?";
  //         }

  //         connection.query(
  //           query,
  //           [outlet_id, start_date, end_date],
  //           (error, results) => {
  //             disconnectDB(connection);
  //             if (error) {
  //               reject(error);
  //             } else {
  //               resolve(results);
  //             }
  //           }
  //         );
  //       })
  //       .catch((error) => reject(error));
  //   });
  // },
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO expenditures SET ?", data, (error, results) => {
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
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE expenditures SET ? WHERE id = ?",
            [data, id],
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

module.exports = Expenditure;
