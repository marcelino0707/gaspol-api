const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Expenditure = {
  getExpenseReport: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          let query =
            "SELECT description, nominal FROM expenditures WHERE outlet_id = ? AND deleted_at IS NULL";

          if (start_date && end_date) {
            query += " AND created_at BETWEEN ? AND ?";
          }

          connection.query(
            query,
            [outlet_id, start_date, end_date],
            (error, results) => {
              disconnectDB(connection);
              if (error) {
                reject(error);
              } else {
                // Calculate total nominal
                const totalExpense = results.reduce((sum, item) => sum + item.nominal, 0);
                
                // Include totalNominal in the results
                resolve({ lists: results, totalExpense });
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
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
