const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Discount = {
    getAll: () => {
        return new Promise((resolve, reject) => {
        connectDB().then((connection) => {
        connection.query("SELECT id, code, type, value, start_date, end_date, min_purchase, max_discount FROM discounts WHERE deleted_at IS NULL", (error, results) => {
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
}

module.exports = Discount;
