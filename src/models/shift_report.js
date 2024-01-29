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
