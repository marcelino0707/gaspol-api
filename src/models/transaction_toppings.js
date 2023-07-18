const { connectDB, disconnectDB } = require('../utils/dbUtils');

const TransactionTopping = {
    create: (transaction_topping) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            connection.query('INSERT INTO transaction_toppings SET ?', transaction_topping, (error, results) => {
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

module.exports = TransactionTopping;