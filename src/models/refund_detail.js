const { connectDB, disconnectDB } = require("../utils/dbUtils");

const RefundDetail = {
  deleteRefundDetailsByRefundId: (refund_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("DELETE FROM refund_details WHERE refund_id = ?", refund_id, (error, results) => {
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
  getByRefundId: (refund_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT refund_details.id AS id, DATE_FORMAT(refund_details.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, refund_details.cart_detail_id,refund_details.refund_reason_item,refund_details.qty_refund_item, refund_details.total_refund_price, payment_types.name AS payment_type_name, payment_categories.name AS payment_category_name, menus.name AS menu_name, menus.menu_type, menu_details.varian, serving_types.name AS serving_type_name, discounts.code AS discount_code, discounts.value AS discounts_value, cart_details.discounted_price AS discounted_price, discounts.is_percent AS discounts_is_percent, cart_details.price AS menu_price, cart_details.note_item FROM refund_details LEFT JOIN cart_details ON refund_details.cart_detail_id = cart_details.id LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN payment_types ON refund_details.payment_type_id = payment_types.id LEFT JOIN payment_categories ON payment_types.payment_category_id = payment_categories.id WHERE refund_details.refund_id = ? ORDER BY refund_details.updated_at DESC", refund_id, (error, results) => {
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
  getByRefundIds: (refundIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT refund_details.id AS id, payment_types.name AS payment_type_name, refund_details.refund_id AS refund_id, refund_details.payment_type_id AS payment_type_id, refund_details.cart_detail_id,refund_details.refund_reason_item,refund_details.qty_refund_item, refund_details.total_refund_price, menus.menu_type AS menu_type, menus.name AS menu_name,menu_details.varian,serving_types.name AS serving_type_name,discounts.code AS discount_code,discounts.value AS discounts_value,cart_details.discounted_price AS discounted_price,discounts.is_percent AS discounts_is_percent, cart_details.price AS menu_price,cart_details.note_item FROM refund_details LEFT JOIN cart_details ON refund_details.cart_detail_id = cart_details.id LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN payment_types ON refund_details.payment_type_id = payment_types.id WHERE refund_details.refund_id IN (?)", 
          [refundIdS], (error, results) => {
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
  getByRefundIdsShift: (refundIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT refund_details.refund_id AS refund_id, cart_details.id AS cart_detail_id, cart_details.menu_id, refund_details.refund_reason_item, cart_details.menu_detail_id, refund_details.qty_refund_item, refund_details.payment_type_id, refund_details.total_refund_price, menus.name AS menu_name, menus.menu_type AS menu_type, menu_details.varian,serving_types.name AS serving_type_name,discounts.code AS discount_code, cart_details.discounted_price AS discounted_price, cart_details.price AS price FROM refund_details LEFT JOIN cart_details ON refund_details.cart_detail_id = cart_details.id LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE refund_details.refund_id IN (?)", 
          [refundIdS], (error, results) => {
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
  getByCartDetailId: (cart_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, refund_id, cart_detail_id, refund_reason_item, qty_refund_item, total_refund_price FROM refund_details WHERE cart_detail_id = ?", cart_detail_id, (error, results) => {
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
  getShiftReport: (outlet_id, start_date, end_date) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          const query =
            "SELECT refund_details.refund_id AS refund_id, refunds.is_refund_type_all, cart_details.id AS cart_detail_id, cart_details.menu_id, cart_details.menu_detail_id, refund_details.qty_refund_item, refund_details.payment_type_id, refund_details.total_refund_price, menus.name AS menu_name, menus.menu_type AS menu_type, menu_details.varian, cart_details.price AS price FROM refund_details LEFT JOIN refunds ON refund_details.refund_id = refunds.id LEFT JOIN cart_details ON refund_details.cart_detail_id = cart_details.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE menus.outlet_id = ? AND refund_details.updated_at BETWEEN ? AND ?";
          connection.query(
            query,
            [outlet_id, start_date, end_date],
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
  create: (refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO refund_details SET ?", refund, (error, results) => {
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
  bulkCreate: (data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "INSERT INTO refund_details (refund_id, cart_detail_id, refund_reason_item, payment_type_id, qty_refund_item, total_refund_price, created_at, updated_at) VALUES ?",
            [
              data.map((item) => [
                item.refund_id,
                item.cart_detail_id,
                item.refund_reason_item,
                item.payment_type_id,
                item.qty_refund_item,
                item.total_refund_price,
                item.created_at,
                item.updated_at,
              ]),
            ],
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
  update: (id, refundDetail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE refund_details SET ? WHERE id = ?", [refundDetail, id], (error, results) => {
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

module.exports = RefundDetail;