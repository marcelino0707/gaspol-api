const { connectDB, disconnectDB } = require('../utils/dbUtils');

const StorageLocationWarehouse = {
  getByStorageLocationWarehouseId: (storage_location_warehouse_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name FROM ingredient_storage_warehouse_locations WHERE id = ? AND deleted_at IS NULL', storage_location_warehouse_id, (error, results) => {
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
          connection.query('SELECT id, name, is_active FROM ingredient_storage_warehouse_locations WHERE deleted_at IS NULL', (error, results) => {
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
          connection.query("INSERT INTO ingredient_storage_warehouse_locations SET ?", data, (error, results) => {
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
          connection.query("UPDATE ingredient_storage_warehouse_locations SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = StorageLocationWarehouse;