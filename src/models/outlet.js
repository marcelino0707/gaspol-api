const { connectDB, disconnectDB } = require('../utils/dbUtils');

const Outlet = {
  getByOutletId: (outlet_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name, address, pin FROM outlets WHERE id = ? AND deleted_at IS NULL', outlet_id, (error, results) => {
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
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT id, name, address FROM outlets WHERE deleted_at IS NULL', (error, results) => {
            disconnectDB();
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
  create: (outlet) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO outlets SET ?", outlet, (error, results) => {
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
  update: (id, outlet) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE outlets SET ? WHERE id = ?", [outlet, id], (error, results) => {
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
          connection.query("UPDATE outlets SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = Outlet;