const { connectDB, disconnectDB } = require("../utils/dbUtils");

const RefundDetail = {
  create: (refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO refund_details SET ?", refund, (error, results) => {
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

module.exports = RefundDetail;
