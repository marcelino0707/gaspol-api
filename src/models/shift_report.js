const { connectDB, disconnectDB } = require("../utils/dbUtils");

const ShiftReport = {
  getLastCreated: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, outlet_id, casher_name, start_date, end_date, shift_number FROM shift_reports WHERE outlet_id = ? AND deleted_at IS NULL AND end_date IS NULL ORDER BY created_at DESC LIMIT 1", outletId, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  },
  getLastShift: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, outlet_id, casher_name, start_date, end_date, shift_number, actual_ending_cash FROM shift_reports WHERE outlet_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 2 OFFSET 1", outletId, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
      });
    });
  },
  getLastStartDateShift: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT start_date, casher_name, shift_number FROM shift_reports WHERE outlet_id = ? AND deleted_at IS NULL ORDER BY start_date DESC LIMIT 2", outletId, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  getShiftByShiftNumber: (outletId, start_date, end_date, shift_number) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        let queryParams = [outletId, start_date, end_date];
        let query = "SELECT id, casher_name, actual_ending_cash, cash_difference, expected_ending_cash, total_amount, total_discount, start_date, end_date, actual_ending_cash, casher_name FROM shift_reports WHERE outlet_id = ? AND deleted_at IS NULL AND start_date BETWEEN ? AND ?";
  
        if (shift_number !== undefined) {
          queryParams.push(shift_number);
          query += " AND shift_number = ?";
        }
  
        connection.query(query, queryParams, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  getShiftNumber: (outletId, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT DISTINCT shift_number FROM shift_reports WHERE outlet_id = ? AND deleted_at IS NULL AND DATE(created_at) BETWEEN ? AND ? ORDER BY shift_number", [outletId, start_date, end_date], (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO shift_reports SET ?", data, (error, results) => {
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
            "UPDATE shift_reports SET ? WHERE id = ?",
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

module.exports = ShiftReport;
