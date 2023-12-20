const { connectDB, disconnectDB } = require('../utils/dbUtils');

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
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE ingredient_order_list_detail s SET ? WHERE id = ?", [data, id], (error, results) => {
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

module.exports = IngredientOrderListDetail;