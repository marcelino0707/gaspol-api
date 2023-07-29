const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Cart = {
    getByOutletId: (id) => {
        return new Promise((resolve, reject) => {
            connectDB()
            .then((connection) => {
                connection.query(
                "SELECT id, outlet_id, subtotal, total, discount_id FROM carts WHERE outlet_id = ? AND deleted_at IS NULL", id,
                (error, results) => {
                    disconnectDB();
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

module.exports = Cart;
