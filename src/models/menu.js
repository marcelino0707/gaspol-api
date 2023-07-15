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
    getByMenuId: (id) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            const query = `SELECT menu_details.id, menus.name, menus.menu_type, serving_types.name AS serving_type_name, menu_details.price FROM menu_details JOIN menus ON menu_details.menu_id = menus.id LEFT JOIN serving_types ON menu_details.serving_type_id = serving_types.id WHERE menu_details.menu_id = ?`;
              connection.query(query, [id], (error, results) => {
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
    getByServingTypeId: (id, serving_type_id) => {
      return new Promise((resolve, reject) => {
        connectDB()
          .then((connection) => {
            const query = `SELECT menu_details.id, menus.name, menus.menu_type, serving_types.name AS serving_type_name, menu_details.price FROM menu_details JOIN menus ON menu_details.menu_id = menus.id LEFT JOIN serving_types ON menu_details.serving_type_id = serving_types.id WHERE menu_details.menu_id = ? AND menu_details.serving_type_id = ?`;
              connection.query(query, [id, serving_type_id], (error, results) => {
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

