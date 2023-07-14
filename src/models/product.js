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
                connection.query('SELECT * FROM outlets WHERE id = ?', id, (error, results) => {
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
}

module.exports = Product;