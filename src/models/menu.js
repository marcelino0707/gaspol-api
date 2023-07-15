const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Menu = {
    getAll: () => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
              connection.query('SELECT id, name, menu_type FROM menus', (error, results) => {
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

module.exports = Menu;

