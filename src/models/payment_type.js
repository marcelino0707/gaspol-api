const { connectDB, disconnectDB } = require("../utils/dbUtils");

const PaymentType = {
  getAll: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT id, name FROM payment_types WHERE is_active = 1 AND deleted_at IS NULL", outletId, (error, results) => {
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
//   getPaymentTypeById: (id) => {
//     return new Promise((resolve, reject) => {
//       connectDB()
//         .then((connection) => {
//           connection.query("SELECT type.name AS payment_type, category.payment_category AS category FROM serving_types LEFT JOIN payment_categories ON type.payment_category_id = category.id WHERE type.id = ? AND type.deleted_at IS NULL", id, (error, results) => {
//             disconnectDB(connection);
//             if (error) {
//               reject(error);
//             } else {
//               resolve(results[0]);
//             }
//           });
//         })
//         .catch((error) => reject(error));
//     });
//   },
//   getById: (id) => {
//     return new Promise((resolve, reject) => {
//       connectDB()
//         .then((connection) => {
//           connection.query(
//             "SELECT id, name, is_active FROM serving_types WHERE id = ? AND deleted_at IS NULL",
//             id,
//             (error, results) => {
//               disconnectDB(connection);
//               if (error) {
//                 reject(error);
//               } else {
//                 resolve(results[0]);
//               }
//             }
//           );
//         })
//         .catch((error) => reject(error));
//     });
//   },
//   getAllCMS: (outletId) => {
//     return new Promise((resolve, reject) => {
//       connectDB().then((connection) => {
//         connection.query("SELECT id, name, is_active FROM serving_types WHERE deleted_at IS NULL", outletId, (error, results) => {
//           disconnectDB(connection);
//           if (error) {
//             reject(error);
//           } else {
//             resolve(results);
//           }
//         });
//       });
//     });
//   },
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO payment_types SET ?", data, (error, results) => {
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
            "UPDATE payment_types SET ? WHERE id = ?",
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

module.exports = PaymentType;
