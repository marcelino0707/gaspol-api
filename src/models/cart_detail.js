const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CartDetail = {
    getByCartId: (cart_id) => {
        return new Promise((resolve, reject) => {
            connectDB()
            .then((connection) => {
                connection.query(
                    "SELECT id AS cart_detail_id, menu_id, menu_detail_id, serving_type_id, discount_id, price, total_price, qty, note_item, is_topping FROM cart_details WHERE cart_id = ? AND deleted_at IS NULL", cart_id,
                    (error, results) => {
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
    create: (cart) => {
        return new Promise((resolve, reject) => {
            connectDB()
            .then((connection) => {
                    connection.query("INSERT INTO cart_details SET ?", cart, (error, results) => {
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
}

module.exports = CartDetail;
