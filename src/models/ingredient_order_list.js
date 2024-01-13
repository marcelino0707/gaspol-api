const {
  connectDB,
  disconnectDB
} = require('../utils/dbUtils');

const IngredientOrderList = {
  getByOutletId: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, outlet_id, storage_location_outlet, order_date, pembuat_order, penanggung_jawab, penerima, pengirim, updated_at FROM ingredient_order_lists WHERE deleted_at IS NULL AND outlet_id = ? AND order_date BETWEEN ? AND ?', [outlet_id, start_date, end_date], (error, results) => {
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
  getReportByOutletId: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, outlet_id, order_date, kordinator_shift_pertama, kordinator_shift_kedua, checker_shift_pertama, checker_shift_kedua FROM ingredient_order_lists WHERE deleted_at IS NULL AND outlet_id = ? AND order_date BETWEEN ? AND ?', [outlet_id, start_date, end_date], (error, results) => {
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
  getAll: (start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, outlet_id, storage_location_outlet, order_date, pembuat_order, penanggung_jawab, penerima, pengirim FROM ingredient_order_lists WHERE deleted_at IS NULL AND order_date BETWEEN ? AND ?', [start_date, end_date], (error, results) => {
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO ingredient_order_lists SET ?", data, (error, results) => {
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
          connection.query("UPDATE ingredient_order_lists SET ? WHERE id = ?", [data, id], (error, results) => {
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

  updateMultiple: async (data) => {
    try {
      const connection = await connectDB();

      const updatePromises = data.map((item) => {
        const {
          id,
          ...updateData
        } = item;
        return connection.format("UPDATE ingredient_order_lists SET ? WHERE id = ?", [updateData, id]);
      }).map((query) => {
        return new Promise((resolve, reject) => {
          connection.query(query, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      });

      await Promise.all(updatePromises);
      disconnectDB(connection);

      return true;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = IngredientOrderList;