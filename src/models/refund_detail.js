const { connectDB, disconnectDB } = require("../utils/dbUtils");

const RefundDetail = {
  getByRefundId: (refund_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, cart_detail_id, refund_reason_item, qty_refund_item, total_refund_price FROM refund_details WHERE refund_id = ?", refund_id, (error, results) => {
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
  getByCartDetailId: (cart_detail_id) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("SELECT id, refund_id, cart_detail_id, refund_reason_item, qty_refund_item, total_refund_price FROM refund_details WHERE cart_detail_id = ?", cart_detail_id, (error, results) => {
            disconnectDB();
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
  create: (refund) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("INSERT INTO refund_details SET ?", refund, (error, results) => {
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
  update: (id, refundDetail) => {
    return new Promise((resolve, reject) => {
      connectDB()
        .then((connection) => {
          connection.query("UPDATE refunds SET ? WHERE id = ?", [refundDetail, id], (error, results) => {
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

module.exports = RefundDetail;