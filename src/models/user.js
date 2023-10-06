const { connectDB, disconnectDB } = require("../utils/dbUtils");

const User = {
  getByUsername: (username) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.execute(
            "SELECT users.id, users.name, users.username, users.password, users.outlet_id, users.role, users.menu_access, outlets.name AS outlet_name FROM users LEFT JOIN outlets ON users.outlet_id = outlets.id WHERE users.username = ? AND users.deleted_at IS NULL",
            [username],
            (error, results) => {
              disconnectDB();
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
  getByUserId: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.execute(
            "SELECT users.id, users.name, users.username, users.outlet_id, users.role, users.menu_access, outlets.name AS outlet_name FROM users LEFT JOIN outlets ON users.outlet_id = outlets.id WHERE users.id = ?",
            [id],
            (error, results) => {
              disconnectDB();
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
  getUsers: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.execute(
            "SELECT users.id, users.name, users.username, users.outlet_id, users.role, users.menu_access, outlets.name AS outlet_name FROM users LEFT JOIN outlets ON users.outlet_id = outlets.id WHERE users.deleted_at IS NULL",
            (error, results) => {
              disconnectDB();
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO users SET ?", data, (error, results) => {
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
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE users SET ? WHERE id = ?", [data, id], (error, results) => {
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
          connection.query("UPDATE users SET ? WHERE id = ?", [data, id], (error, results) => {
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
};

module.exports = User;
