const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Cart = {
  getQueuingByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, outlet_id, subtotal, total, discount_id FROM carts WHERE outlet_id = ? AND is_queuing = 1 AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1", outlet_id, (error, results) => {
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
  getByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, outlet_id, subtotal, total, discount_id FROM carts WHERE outlet_id = ? AND is_active = 1 AND deleted_at IS NULL", outlet_id, (error, results) => {
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
  getByCartId: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT carts.id AS id, carts.outlet_id, carts.subtotal, carts.total, carts.discount_id, carts.cart_id_main_split, discounts.code AS discount_code, discounts.value AS discounts_value, discounts.is_percent AS discounts_is_percent FROM carts LEFT JOIN discounts ON carts.discount_id = discounts.id WHERE carts.id = ? AND carts.deleted_at IS NULL", id, (error, results) => {
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
  getOldCartBySplitCartId: (split_cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id FROM carts WHERE id = ? AND deleted_at IS NULL", split_cart_id, (error, results) => {
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
  getNotYetPaidByCartId: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT total FROM carts WHERE id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  getActiveCartId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id FROM carts WHERE outlet_id = ? AND is_active = 1 AND deleted_at IS NULL", outlet_id, (error, results) => {
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
  create: (cart) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO carts SET ?", cart, (error, results) => {
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
  update: (id, cart) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE carts SET ? WHERE id = ?", [cart, id], (error, results) => {
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
  delete: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE carts SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = Cart;
