const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CartDetail = {
  getByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, cart_details.discount_id, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details INNER JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL",
            cart_id,
            (error, results) => {
              disconnectDB();
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
  getByCartDetailId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, serving_types.percent AS serving_type_percent, cart_details.discount_id, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details INNER JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id WHERE cart_details.id = ? AND cart_details.deleted_at IS NULL",
            cart_id,
            (error, results) => {
              disconnectDB();
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
  create: (cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO cart_details SET ?", cart_detail, (error, results) => {
            disconnectDB();
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
  update: (id, cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE id = ?", [cart_detail, id], (error, results) => {
            disconnectDB();
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
  delete: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE id = ?", [data, id], (error, results) => {
            disconnectDB();
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

module.exports = CartDetail;
