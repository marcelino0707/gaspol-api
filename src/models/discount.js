const { connectDB, disconnectDB } = require("../utils/dbUtils");

const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const Discount = {
  getAll: (is_discount_cart) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        let currentDate = getCurrentDateTime();
        let query =
          "SELECT id, code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount FROM discounts WHERE deleted_at IS NULL";
        if (is_discount_cart !== undefined) {
          if (is_discount_cart == 1) {
            query += " AND is_discount_cart = 1";
          } else {
            query += " AND is_discount_cart = 0";
          }
        }
        query += ` AND (CONCAT(start_date, ' ', TIME(start_date)) <= '${currentDate}' AND CONCAT(end_date, ' ', TIME(end_date)) >= '${currentDate}')`;
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
