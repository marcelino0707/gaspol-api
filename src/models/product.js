const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Product = {
    getAll: () => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
              connection.query('SELECT id, id_outlet, name, stock, cost, unit FROM products', (error, results) => {
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
    getById: (id) => {
      return new Promise((resolve, reject) => {
          connectDB()
          .then((connection) => {
              connection.query('SELECT id, id_outlet, name, stock, cost, unit FROM products WHERE id = ?', id, (error, results) => {
                disconnectDB();
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0] || null);
                }
              });
          })
          .catch((error) => reject(error));
      });
    },
    create: (product) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            connection.query('INSERT INTO products SET ?', product, (error, results) => {
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
    update: (id, product) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            connection.query('UPDATE products SET ? WHERE id = ?', [product, id], (error, results) => {
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
            connection.query('UPDATE products SET ? WHERE id = ?', [data, id], (error, results) => {
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

module.exports = Product;