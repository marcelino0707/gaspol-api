const { connectDB, disconnectDB } = require("../utils/dbUtils");

const CartDetail = {
  getByCartId: (cart_id, emptyQty) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, cart_details.is_ordered, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.discount_id, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent,cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND (cart_details.is_canceled = 0 OR cart_details.is_canceled IS NULL) AND cart_details.deleted_at IS NULL" + 
            (emptyQty ? " AND cart_details.qty != 0" : "") +
            ";",
            cart_id,
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
  getReportByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, DATE_FORMAT(cart_details.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, cart_details.is_ordered, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.discount_id, discounts.code AS discount_code, discounts.value AS discounts_value, cart_details.discounted_price, discounts.is_percent AS discounts_is_percent, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL AND cart_details.qty != 0 AND (cart_details.is_canceled IS NULL || cart_details.is_canceled = 0) ORDER BY cart_details.updated_at DESC",
            cart_id,
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
  getDiscountedItemsByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS cart_detail_id, subtotal_price FROM cart_details WHERE cart_id = ? AND (is_canceled = 0 || is_canceled IS NULL) AND deleted_at IS NULL AND qty != 0 AND (discount_id != NULL || discount_id != 0)",
            cart_id,
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
  getNotOrderedByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.discount_id, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent,cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL AND cart_details.is_ordered = 0",
            cart_id,
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
  getOrderedByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id FROM cart_details WHERE cart_id = ? AND is_ordered = 1",
            cart_id,
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
  getCanceledByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item, cart_details.cancel_reason FROM cart_details LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL AND cart_details.is_ordered = 1 AND cart_details.is_canceled = 1 AND cart_details.is_cancel_printed = 0",
            cart_id,
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
  getCanceledByCartIdStructChecker: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, DATE_FORMAT(cart_details.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item, cart_details.cancel_reason, discounts.code AS discount_code, discounts.value AS discounts_value, discounts.is_percent AS discounts_is_percent FROM cart_details LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN discounts ON cart_details.discount_id = discounts.id WHERE cart_details.cart_id = ? AND cart_details.deleted_at IS NULL AND cart_details.is_ordered = 1 AND cart_details.is_canceled = 1 ORDER BY cart_details.updated_at DESC",
            cart_id,
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
  getByCartIds: (cartIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT menus.id AS menu_id, cart_details.menu_detail_id AS menu_varian_id, menus.name AS menu_name, menus.menu_type, menu_details.varian, serving_types.name AS serving_type_name, discounts.code AS discount_code, discounts.value AS discounts_value, discounted_price, discounts.is_percent AS discounts_is_percent, cart_details.price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id IN (?) AND cart_details.deleted_at IS NULL",
            [cartIdS],
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
  getByCartIdsShift: (cartIdS) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.cart_id, cart_details.id AS cart_detail_id, cart_details.discount_id, cart_details.is_canceled, cart_details.cancel_reason, cart_details.menu_id, cart_details.note_item, cart_details.menu_detail_id, menus.name AS menu_name, menus.menu_type, menu_details.varian, serving_types.name AS serving_type_name, discounts.code AS discount_code, cart_details.discounted_price, cart_details.price, cart_details.subtotal_price, cart_details.total_price, cart_details.qty FROM cart_details LEFT JOIN discounts ON cart_details.discount_id = discounts.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id LEFT JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id WHERE cart_details.cart_id IN (?) AND cart_details.deleted_at IS NULL",
            [cartIdS],
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
  getByCartDetailId: (cart_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT cart_details.id AS cart_detail_id, cart_details.menu_id, cart_details.is_ordered, menus.name AS menu_name, menus.menu_type, cart_details.menu_detail_id, cart_details.discount_id, menu_details.varian, cart_details.serving_type_id, serving_types.name AS serving_type_name, cart_details.price, cart_details.discounted_price, cart_details.subtotal_price, cart_details.total_price, cart_details.qty, cart_details.note_item FROM cart_details INNER JOIN menus ON cart_details.menu_id = menus.id LEFT JOIN menu_details ON cart_details.menu_detail_id = menu_details.id LEFT JOIN serving_types ON cart_details.serving_type_id = serving_types.id WHERE cart_details.id = ? AND cart_details.deleted_at IS NULL",
            cart_detail_id,
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
  getRefRefundDetailsByCartId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT id AS cart_detail_id, ref_refund_detail_id FROM cart_details WHERE cart_id = ?",
            cart_id,
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
  getRefDetailIdsByCardId: (cart_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query(
            "SELECT ref_refund_detail_id FROM cart_details WHERE cart_id = ?",
            cart_id,
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
  create: (cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO cart_details SET ?", cart_detail, (error, results) => {
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
            "INSERT INTO cart_details (cart_id, ref_refund_detail_id, menu_id, menu_detail_id, serving_type_id, price, subtotal_price, total_price, qty, note_item, is_ordered, is_canceled, is_cancel_printed, cancel_reason, discount_id, discounted_price, created_at, updated_at) VALUES ?",
            [
              data.map((item) => [
                item.cart_id,
                item.ref_refund_detail_id,
                item.menu_id,
                item.menu_detail_id,
                item.serving_type_id,
                item.price,
                item.subtotal_price,
                item.total_price,
                item.qty,
                item.note_item,
                item.is_ordered,
                item.is_canceled,
                item.is_cancel_printed,
                item.cancel_reason,
                item.discount_id,
                item.discounted_price,
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
  update: (id, cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE id = ?", [cart_detail, id], (error, results) => {
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
  updateByRefRefundDetailId: (ref_refund_detail_id, cart_detail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE ref_refund_detail_id = ?", [cart_detail, ref_refund_detail_id], (error, results) => {
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
  updateAllByCartId: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE cart_id = ?", [data, id], (error, results) => {
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
  updateAllByCartDetailId: (id, data) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE cart_details SET ? WHERE id IN (?)", [data, id], (error, results) => {
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

module.exports = CartDetail;
