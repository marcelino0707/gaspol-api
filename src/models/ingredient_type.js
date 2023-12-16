const { connectDB, disconnectDB } = require('../utils/dbUtils');

const IngredientType = {
  getByIngredientTypeId: (ingredient_type_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name FROM ingredient_types WHERE id = ? AND deleted_at IS NULL', ingredient_type_id, (error, results) => {
            disconnectDB(connection);
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
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name, is_active FROM ingredient_types WHERE deleted_at IS NULL', (error, results) => {
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO ingredient_types SET ?", data, (error, results) => {
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
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE ingredient_types SET ? WHERE id = ?", [data, id], (error, results) => {
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
  }
};

module.exports = IngredientType;