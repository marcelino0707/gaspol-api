const { connectDB, disconnectDB } = require("../utils/dbUtils");

const IntallmentCart = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, cart_id, total, created_at FROM installment_carts WHERE deleted_at IS NULL",
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
  getByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, total, created_at FROM installment_carts WHERE cart_id = ? AND deleted_at IS NULL",
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO installment_carts SET ?", data, (error, results) => {
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

module.exports = IntallmentCart;
