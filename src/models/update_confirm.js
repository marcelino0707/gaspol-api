const { connectDB, disconnectDB } = require("../utils/dbUtils");

const UpdateConfirm = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            connectDB()
            .then((connection) => {
                connection.query('SELECT outlet_id, outlet_name, version, new_version, last_updated FROM update_confirms ORDER BY last_updated DESC LIMIT 20', (error, results) => {
                disconnectDB(connection);
                if (error) {
                    reject(error);
                } else {
                    resolve(results || null);
                }
                });
            })
            .catch((error) => reject(error));
        });
    },
    create: (updateConfirm) => {
        return new Promise((resolve, reject) => {
            connectDB()
            .then((connection) => {
                connection.query("INSERT INTO update_confirms SET ?", updateConfirm, (error, results) => {
                disconnectDB(connection);
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

module.exports = UpdateConfirm