const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CartDetail = {
  getByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.discount_id, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent,cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL",
            cart_id,
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
  getNotOrderedByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.discount_id, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent,cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL AND cart_details.is_ordered = 0",
            cart_id,
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
  getByCartIds: (cartIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT menus.name AS menu_name, menus.menu_type, menu_details.varian, serving_types.name AS serving_type_name, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id IN (?) AND cart_details.deleted_at IS NULL",
            [cartIdS],
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
  getByCartDetailId: (cart_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, cart_details.discount_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.price, cart_details.discounted_price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details INNER JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id WHERE cart_details.id = ? AND cart_details.deleted_at IS NULL",
            cart_detail_id,
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
  create: (cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO cart_details SET ?", cart_detail, (error, results) => {
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
  update: (id, cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE id = ?", [cart_detail, id], (error, results) => {
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
  updateAllByCartId: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE cart_id = ?", [data, id], (error, results) => {
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

module.exports = CartDetail;
