const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Discount = {
  getAll: (is_discount_cart) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        let query =
          "SELECT id, code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount FROM discounts WHERE deleted_at IS NULL";
        if (is_discount_cart !== undefined) {
          if (is_discount_cart == 1) {
            query += " AND is_discount_cart = 1";
          } else {
            query += " AND is_discount_cart = 0";
          }
        }
        connection.query(query, (error, results) => {
          disconnectDB();
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount FROM discounts WHERE deleted_at IS NULL AND id = ?",
            id,
            (error, results) => {
              disconnectDB();
              if (error) {
                reject(error);
              } else {
                resolve(results[0]);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
};

module.exports = Discount;
