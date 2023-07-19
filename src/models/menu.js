const { connectDB, disconnectDB } = require("../utils/dbUtils");

const Menu = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, name, menu_type FROM menus", (error, results) => {
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
          const query = `SELECT menu_details.id, menus.name, menus.menu_type, serving_type, varian, menu_details.price FROM menu_details JOIN menus ON menu_details.menu_id = menus.id WHERE menu_details.menu_id = ?`;
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
  getByServingTypeId: (id, serving_type) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query = `SELECT menu_details.id, menus.name, menus.menu_type, serving_type, varian, menu_details.price FROM menu_details JOIN menus ON menu_details.menu_id = menus.id WHERE menu_details.menu_id = ? AND menu_details.serving_type = ?`;
          connection.query(query, [id, serving_type], (error, results) => {
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
  createMenus: (menu) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO menus SET ?", menu, (error, results) => {
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
  createMenuDetail: (menuDetailData) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO menu_details SET ?", menuDetailData, (error, results) => {
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
  updateMenus: (id, updateMenu) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE menus SET ? WHERE id = ?", [updateMenu, id], (error, results) => {
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
  updateMenuDetail: (id, menuDetail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE menu_details SET ? WHERE menu_id = ?", [menuDetail, id], (error, results) => {
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

module.exports = Menu;
