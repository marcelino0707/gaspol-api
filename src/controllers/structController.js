const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Transaction = require("../models/transaction");
const Discount = require("../models/discount");
const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");

exports.getCustomerStruct = async (req, res) => {
    const { id } = req.params;
    // const { outlet_id } = req.query;
    try {
      const transaction = await Transaction.getById(id);
      const cart = await Cart.getByCartId(transaction.cart_id);
      const cartDetails = await CartDetail.getByCartId(transaction.cart_id);
      const refund = await Refund.getByTransactionId(id);
      let refundDetails = [];
      if(refund) {
        refundDetails = await RefundDetail.getByRefundId(refund.id);
      }
      const result = {
        transaction_id: transaction.id,
        receipt_number: transaction.receipt_number,
        customer_name: transaction.customer_name,
        customer_seat: transaction.customer_seat,
        cart_id: transaction.cart_id,
        subtotal: cart.subtotal,
        total: cart.total,
        discount_id: cart.discount_id,
        discount_code: cart.discount_code,
        discounts_value: cart.discounts_value,
        discounts_is_percent: cart.discounts_is_percent,
        cart_details: cartDetails,
      };
  
      if(refund) {
        result.is_refund_all = refund.is_refund_all;
        result.refund_reason = refund.refund_reason;
        result.refund_details = refundDetails;
      }
  
      if (transaction.invoice_number == null) {
        // Activate cart
        await Cart.update(transaction.cart_id, {
          is_active: true,
        });
      }
  
      return res.status(200).json({
        code: 200,
        message: "Cart berhasil ditampilkan!",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Some error occurred while get the transaction",
      });
    }
};

exports.getKitchenStruct = async (req, res) => {

}

