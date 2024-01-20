const { connectDB, disconnectDB } = require("../utils/dbUtils");

const PaymentCategory = {
  getAll: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, name, outlet_id FROM payment_categories WHERE outlet_id = ? AND deleted_at IS NULL", outletId, (error, results) => {
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
}

module.exports = PaymentCategory;
