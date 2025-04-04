const { connectDB, disconnectDB } = require("../utils/dbUtils");

const MenuDetail = {
  getAllByMenuID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS menu_detail_id, varian, price FROM menu_details WHERE menu_id = ? AND deleted_at IS NULL",
            id,
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
  getAllVarianByMenuID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS menu_detail_id, varian, price FROM menu_details WHERE menu_id = ? AND deleted_at IS NULL",
            id,
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
  getAllToppingByMenuID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS menu_detail_id, varian, price FROM menu_details WHERE menu_id = ? AND deleted_at IS NULL",
            id,
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
  getByID: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS menu_detail_id, menu_id, varian, price FROM menu_details WHERE id = ? AND deleted_at IS NULL",
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
  create: (menu_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "INSERT INTO menu_details SET ?",
            menu_detail,
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
  update: (id, menuDetail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE menu_details SET ? WHERE id = ?",
            [menuDetail, id],
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
  // updateMultiple: (menuDetails) => {
  //   return new Promise((resolve, reject) => {
  //     connectDB()
  //       .then((connection) => {
  //         const updateQueries = menuDetails.map((item) => {
  //           const { menu_detail_id, varian } = item;
  //           return new Promise((innerResolve, innerReject) => {
  //             connection.query(
  //               "UPDATE menu_details SET varian = ? WHERE id = ?",
  //               [varian, menu_detail_id],
  //               (error, results) => {
  //                 if (error) {
  //                   innerReject(error);
  //                 } else {
  //                   innerResolve(results);
  //                 }
  //               }
  //             );
  //           });
  //         });

  //         // Execute multiple update queries
  //         Promise.all(updateQueries)
  //           .then((results) => {
  //             disconnectDB(connection);
  //             resolve(results);
  //           })
  //           .catch((error) => {
  //             disconnectDB(connection);
  //             reject(error);
  //           });
  //       })
  //       .catch((error) => reject(error));
  //   });
  // },
  delete: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE menu_details SET ? WHERE id = ?",
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
  deleteByMenuID: (menu_id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "UPDATE menu_details SET ? WHERE menu_id = ?",
            [data, menu_id],
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

module.exports = MenuDetail;
