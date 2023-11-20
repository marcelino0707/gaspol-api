const { connectDB, disconnectDB } = require("../utils/dbUtils");
const moment = require("moment-timezone");

const getCurrentDateTime = () => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const now = indoDateTime;
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
          "SELECT id, code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount, updated_at FROM discounts WHERE deleted_at IS NULL";
        if (is_discount_cart !== undefined) {
          if (is_discount_cart == 1) {
            query += " AND is_discount_cart = 1";
          } else {
            query += " AND is_discount_cart = 0";
          }
        }
        query += ` AND (CONCAT(start_date, ' ', TIME(start_date)) <= '${currentDate}' AND CONCAT(end_date, ' ', TIME(end_date)) >= '${currentDate}')`;
        connection.query(query, (error, results) => {
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
  getAllV2: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, code, is_percent, is_discount_cart, value, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i') as start_date, DATE_FORMAT(end_date, '%Y-%m-%d %H:%i') as end_date, min_purchase, max_discount, DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updated_at FROM discounts WHERE outlet_id = ? AND deleted_at IS NULL", outlet_id, (error, results) => {
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
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, code, is_percent, is_discount_cart, value, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i') as start_date, DATE_FORMAT(end_date, '%Y-%m-%d %H:%i') as end_date, min_purchase, max_discount, updated_at FROM discounts WHERE deleted_at IS NULL AND id = ?",
            id,
            (error, results) => {
              disconnectDB(connection);
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO discounts SET ?", data, (error, results) => {
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
          connection.query("UPDATE discounts SET ? WHERE id = ?", [data, id], (error, results) => {
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
};

module.exports = Discount;
