const { connectDB, disconnectDB } = require('../utils/dbUtils');

const ServingType = {
    getAll: () => {
        return new Promise ((resolve, reject) => {
            connectDB()
            .then((connection) => {
                connection.query('SELECT id, name, percent FROM serving_types', (error, results) => {
                    disconnectDB();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        });
    }
}

module.exports = ServingType;