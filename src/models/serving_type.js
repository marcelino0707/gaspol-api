const { connectDB, disconnectDB } = require("../utils/dbUtils");

const ServingType = {
  getAll: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, name FROM serving_types WHERE is_active = 1 AND deleted_at IS NULL", outletId, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id, name, is_active FROM serving_types WHERE id = ? AND deleted_at IS NULL",
            id,
            (error, results) => {
              disconnectDB(connection);
              if (error) {
                reject(error);
              } else {
                resolve(results[0]);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
  getAllCMS: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, name, is_active FROM serving_types WHERE deleted_at IS NULL", outletId, (error, results) => {
          disconnectDB(connection);
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
  },
  getServingTypeById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT name, percent FROM serving_types WHERE id = ?", id, (error, results) => {
            disconnectDB(connection);
            if (error) {
              reject(error);
            } else {
              resolve(results[0]);
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
          connection.query("INSERT INTO serving_types SET ?", data, (error, results) => {
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
          connection.query(
            "UPDATE serving_types SET ? WHERE id = ?",
            [data, id],
            (error, results) => {
              disconnectDB(connection);
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        })
        .catch((error) => reject(error));
    });
  },
};

module.exports = ServingType;
