const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Ingredient = {
  getByIngredientId: (ingredient_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredients.id, ingredients.name AS name, ingredients.ingredient_type_id, ingredients.ingredient_unit_type_id, ingredients.storage_location_warehouse_id, ingredients.supplier_id, ingredient_types.name AS ingredient_type_name, ingredients.ingredient_access, ingredient_unit_types.name AS ingredient_unit_type_name, ingredient_storage_warehouse_locations.name AS ingredient_storage_warehouse_location_name FROM ingredients LEFT JOIN ingredient_types ON ingredients.ingredient_type_id = ingredient_types.id LEFT JOIN ingredient_unit_types ON ingredients.ingredient_unit_type_id = ingredient_unit_types.id LEFT JOIN ingredient_storage_warehouse_locations ON ingredients.storage_location_warehouse_id = ingredient_storage_warehouse_locations.id WHERE ingredients.deleted_at IS NULL AND ingredients.id = ?', ingredient_id, (error, results) => {
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
          connection.query('SELECT ingredients.id, ingredients.name AS name, ingredients.ingredient_type_id, ingredients.ingredient_unit_type_id, ingredients.storage_location_warehouse_id, ingredients.supplier_id, ingredient_types.name AS ingredient_type_name, ingredients.ingredient_access, ingredient_unit_types.name AS ingredient_unit_type_name, ingredient_storage_warehouse_locations.name AS ingredient_storage_warehouse_location_name FROM ingredients LEFT JOIN ingredient_types ON ingredients.ingredient_type_id = ingredient_types.id LEFT JOIN ingredient_unit_types ON ingredients.ingredient_unit_type_id = ingredient_unit_types.id LEFT JOIN ingredient_storage_warehouse_locations ON ingredients.storage_location_warehouse_id = ingredient_storage_warehouse_locations.id WHERE ingredients.deleted_at IS NULL', (error, results) => {
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
          connection.query("INSERT INTO ingredients SET ?", data, (error, results) => {
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
          connection.query("UPDATE ingredients SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = Ingredient;