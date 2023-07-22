const { connectDB, disconnectDB } = require("../utils/dbUtils");

const MenuDetail = {
  getAllByMenuID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id AS menu_detail_id, varian, price AS dine_in_price FROM menu_details WHERE menu_id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  getIdByMenuID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id FROM menu_details WHERE menu_id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  getMenuDetailById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = "SELECT id AS menu_detail_id, menu_id AS menu, varian, price AS dine_in_price FROM menu_details WHERE id = ?";
          connection.query(query, id, (error, results) => {
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
  create: (menu_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO menu_details SET ?", menu_detail, (error, results) => {
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
  update: (id, menuDetail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE menu_details SET ? WHERE id = ?", [menuDetail, id], (error, results) => {
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
          connection.query("UPDATE menu_details SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = MenuDetail;
