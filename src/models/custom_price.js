const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CustomPrice = {
  getAllCustomPrices: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, name FROM custom_prices WHERE deleted_at IS NULL",
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
  getCustomMenuPricesByMenuId: (menuId) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cmp.id, cmp.menu_detail_id, cmp.custom_price_id, cmp.price, md.varian FROM custom_menu_prices cmp LEFT JOIN menu_details md ON cmp.menu_detail_id = md.id WHERE cmp.menu_id = ? AND cmp.deleted_at IS NULL AND md.deleted_at IS NULL",
            menuId,
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO custom_menu_prices SET ?", data, (error, results) => {
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
  createMultiple: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "INSERT INTO custom_menu_prices (menu_id, menu_detail_id, price, custom_price_id) VALUES ?",
            [
              data.map((item) => [
                item.menu_id,
                item.menu_detail_id,
                item.price,
                item.custom_price_id,
              ]),
            ],
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
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE custom_menu_prices SET ? WHERE id = ?",
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

module.exports = CustomPrice;
