const {
  connectDB,
  disconnectDB
} = require('../utils/dbUtils');

const IngredientOrderListDetail = {
  getByIngredientOrderListId: (ingredient_order_list_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT ingredient_order_list_details.id, ingredient_order_list_details.ingredient_id, ingredient_order_list_details.leftover, ingredient_order_list_details.order_request_quantity, ingredient_order_list_details.real FROM ingredient_order_list_details WHERE ingredient_order_list_details.deleted_at IS NULL AND ingredient_order_list_details.ingredient_order_list_id = ?', ingredient_order_list_id, (error, results) => {
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
  getByIngredientOrderListIds: (ingredient_order_list_ids) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query('SELECT iod.id, iod.ingredient_order_list_id, iod.ingredient_id, iod.order_request_quantity, i.name AS ingredient_name, i.ingredient_type_id AS ingredient_type_id, i.ingredient_unit_type_id AS ingredient_unit_type_id FROM ingredient_order_list_details iod JOIN ingredients i ON iod.ingredient_id = i.id WHERE iod.deleted_at IS NULL AND iod.ingredient_order_list_id IN (?)', [ingredient_order_list_ids], (error, results) => {
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
  create: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO ingredient_order_list_detail s SET ?", data, (error, results) => {
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
  createMultiple: (orderListId, ingredientIds) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const values = ingredientIds.map((ingredient_id) => [orderListId, ingredient_id]);
          connection.query(
            "INSERT INTO ingredient_order_list_details (ingredient_order_list_id, ingredient_id) VALUES ?",
            [values],
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
  updateMultiple: async (data) => {
    try {
      const connection = await connectDB();

      const updatePromises = data.map((item) => {
        const {
          id,
          ...updateData
        } = item;
        return connection.format("UPDATE ingredient_order_list_details SET ? WHERE id = ?", [updateData, id]);
      }).map((query) => {
        return new Promise((resolve, reject) => {
          connection.query(query, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      });

      await Promise.all(updatePromises);
      disconnectDB(connection);

      return true;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = IngredientOrderListDetail;