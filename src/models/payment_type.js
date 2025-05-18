const { connectDB, disconnectDB } = require("../utils/dbUtils");

const PaymentType = {
  // kasir
  getAll: () => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT payment_types.id, payment_types.name, payment_types.payment_category_id, payment_categories.name AS payment_category_name, payment_types.order " + // Add 'order' to SELECT clause
        "FROM payment_types " +
        "JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id " +
        "WHERE payment_types.outlet_id = 1 AND payment_types.is_active = 1 AND payment_types.deleted_at IS NULL " + 
        "ORDER BY payment_types.order ASC", (error, results) => {
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
  getAllCMS: () => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        // connection.query("SELECT payment_types.id, payment_types.name, payment_types.payment_category_id AS payment_category_id, payment_categories.name AS payment_category_name, payment_types.is_active, payment_types.order FROM payment_types JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE payment_types.outlet_id = ? AND payment_types.deleted_at IS NULL", outletId, (error, results) => {
        connection.query("SELECT payment_types.id, payment_types.name, payment_types.payment_category_id AS payment_category_id, payment_categories.name AS payment_category_name, payment_types.is_active, payment_types.order FROM payment_types JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE payment_types.outlet_id = 1 AND payment_types.deleted_at IS NULL ORDER BY payment_types.order ASC", (error, results) => {
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
  getAllAndCategory: (outletId) => {
    return new Promise((resolve, reject) => {
      connectDB().then((connection) => {
        connection.query("SELECT payment_types.id, payment_types.name, payment_types.payment_category_id, payment_categories.name AS payment_category_name FROM payment_types JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE payment_types.deleted_at IS NULL", outletId, (error, results) => {
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
  getPaymentTypeById: (id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, name, outlet_id, payment_category_id, is_active FROM payment_types WHERE id = ? AND deleted_at IS NULL", id, (error, results) => {
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
  bulkUpdateOrder: (paymentTypesOrder) => {
    return new Promise((resolve, reject) => {
      if (!paymentTypesOrder.length) return resolve();

      const ids = paymentTypesOrder.map((pt) => pt.id);
      const caseStatements = paymentTypesOrder
        .map((pt) => `WHEN ${pt.id} THEN ${pt.order}`)
        .join(" ");

      const query = `
        UPDATE payment_types
        SET \`order\` = CASE id
          ${caseStatements}
        END
        WHERE id IN (${ids.join(",")})
      `;

      connectDB()
        .then((connection) => {
          connection.query(query, (error, results) => {
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
};

module.exports = PaymentType;
