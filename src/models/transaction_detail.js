const { connectDB, disconnectDB } = require('../utils/dbUtils');

const TransactionDetail = {
    create: (transaction_detail) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            connection.query('INSERT INTO transaction_details SET ?', transaction_detail, (error, results) => {
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

module.exports = TransactionDetail;