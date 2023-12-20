const { connectDB, disconnectDB } = require('../utils/dbUtils');
const moment = require("moment-timezone");

const IngredientOrderList = {
  getByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      const thisTimeNow = moment();
      const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
      const dateNowString = moment(indoDateTime).format("YYYY-MM-DD");
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredient_order_lists.id, ingredient_order_lists.outlet_id, ingredient_order_lists.storage_location_outlet, ingredient_order_lists.order_date, ingredient_order_lists.pembuat_order, ingredient_order_lists.penanggung_jawab, ingredient_order_lists.penerima, ingredient_order_lists.pengirim FROM ingredient_order_lists WHERE ingredient_order_lists.deleted_at IS NULL AND ingredient_order_lists.outlet_id = ? AND DATE(order_date) = ?', [outlet_id, dateNowString], (error, results) => {
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
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredient_order_lists.id, ingredient_order_lists.outlet_id, ingredient_order_lists.storage_location_outlet, ingredient_order_lists.order_date, ingredient_order_lists.pembuat_order, ingredient_order_lists.penanggung_jawab, ingredient_order_lists.penerima, ingredient_order_lists.pengirim FROM ingredient_order_lists WHERE ingredient_order_lists.deleted_at IS NULL', (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results || null);
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
  }
};

module.exports = IngredientOrderList;