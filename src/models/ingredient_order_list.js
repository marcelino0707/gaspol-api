const {
  connectDB,
  disconnectDB
} = require('../utils/dbUtils');

const IngredientOrderList = {
  getByOutletId: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredient_order_lists.id, ingredient_order_lists.outlet_id, ingredient_order_lists.storage_location_outlet, ingredient_order_lists.order_date, ingredient_order_lists.pembuat_order, ingredient_order_lists.penanggung_jawab, ingredient_order_lists.penerima, ingredient_order_lists.pengirim FROM ingredient_order_lists WHERE ingredient_order_lists.deleted_at IS NULL AND ingredient_order_lists.outlet_id = ? AND order_date BETWEEN ? AND ?', [outlet_id, start_date, end_date], (error, results) => {
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
  getAll: (start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredient_order_lists.id, ingredient_order_lists.outlet_id, ingredient_order_lists.storage_location_outlet, ingredient_order_lists.order_date, ingredient_order_lists.pembuat_order, ingredient_order_lists.penanggung_jawab, ingredient_order_lists.penerima, ingredient_order_lists.pengirim FROM ingredient_order_lists WHERE ingredient_order_lists.deleted_at IS NULL AND order_date BETWEEN ? AND ?', [start_date, end_date], (error, results) => {
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