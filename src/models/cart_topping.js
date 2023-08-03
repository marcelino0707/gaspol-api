const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CartTopping = {
  getByCartDetailId: (cart_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_toppings.id AS cart_topping_id, cart_toppings.menu_detail_id, menu_details.varian, cart_toppings.price, cart_toppings.qty, cart_toppings.total_price FROM cart_toppings LEFT JOIN menu_details ON cart_toppings.menu_detail_id = menu_details.id WHERE cart_toppings.cart_detail_id = ? AND cart_toppings.deleted_at IS NULL AND menu_details.is_topping = 1",
            cart_detail_id,
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
  create: (topping) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO cart_toppings SET ?", topping, (error, results) => {
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
          connection.query("UPDATE cart_toppings SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = CartTopping;
