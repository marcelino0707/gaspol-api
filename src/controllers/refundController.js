const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const Transaction = require("../models/transaction");
const CartDetail = require("../models/cart_detail");
const Cart = require("../models/cart");

exports.createRefund = async (req, res) => {
  try {
    const { transaction_id, is_refund_all, cart_id, refund_reason, cart_details } = req.body;
    const refund = await Refund.getByTransactionId(transaction_id);

    let refundId,
      totalRefund = 0;
    if (refund) {
      refundId = refund.id;
      totalRefund = refund.total_refund_price;
    } else {
      const newRefund = {
        transaction_id: transaction_id,
        is_refund_all: is_refund_all,
        refund_reason: refund_reason,
      };
      const createdRefund = await Refund.create(newRefund);
      refundId = createdRefund.insertId;
    }

    if (cart_details) {
      for (const cartDetail of cart_details) {
        const cartDetails = await CartDetail.getByCartDetailId(cartDetail.cart_detail_id);
        const qtyUpdate = cartDetails.qty - cartDetail.qty_refund;
        const totalPriceCartDetail = qtyUpdate * cartDetails.price;
        await CartDetail.update(cartDetail.cart_detail_id, {
          qty: qtyUpdate,
          total_price: totalPriceCartDetail,
        });
        const cart = await Cart.getByCartId(cart_id);
        const updateTotalCart = cart.total - totalPriceCartDetail;
        await Cart.update(cart.id, {
          total: updateTotalCart,
        });

        if (cartDetails.discount_id === null) {
          const refundDetailData = {
            refund_id: refundId,
            cart_detail_id: cartDetail.cart_detail_id,
            total_refund_item: cartDetail.qty_refund,
            refund_reason_item: cartDetail.refund_reason,
          };
          refundDetailData.total_refund_price = cartDetail.qty_refund * cartDetails.price;

          await RefundDetail.create(refundDetailData);
          refundDetailId = refundDetailData.insertId;
          totalRefund = totalRefund + refundDetailData.total_refund_price;
        } else {
          const refundDetailData = {
            refund_id: refundId,
            cart_detail_id: cartDetail.cart_detail_id,
            total_refund_item: cartDetails.qty,
            refund_reason_item: cartDetail.refund_reason,
          };
          refundDetailData.total_refund_price = cartDetail.qty * cartDetails.discounted_price;

          const createdRefundDetail = await RefundDetail.create(refundDetailData);
          refundDetailId = createdRefundDetail.insertId;
          totalRefund = totalRefund + refundDetailData.total_refund_price;
        }

        await Refund.update(refundId, {
          total_refund_price: totalRefund,
        });
      }

      const cartDetails = await CartDetail.getByCartDetailId(cart_details.cart_detail_id);
      if (cartDetails.qty == 0) {
        const refund_details = await RefundDetail.getByRefundId(refundId);
        for (const refundDetail of refund_details) {
          const cartDetails = await CartDetail.getByCartDetailId(refundDetail.cart_detail_id);
          const refundDetailData = {
            total_refund_item: refundDetail.qty,
            total_refund_price: cartDetails.total_price,
          };
          await RefundDetail.update(refundDetail.id, refundDetailData);

          const cart = await Cart.getByCartId(cart_id);
          totalRefund = cart.total;
        }
        await CartDetail.update(cart_details.cart_detail_id, {
          qty: 0,
          total_price: 0,
        });
        await Cart.update(cart_id, {
          total: 0,
        });

        await Refund.update(refundId, {
          total_refund_price: totalRefund,
          is_refund_all: true,
        });
      }
    }

    return res.status(201).json({
      message: "Refund berhasil dilakukan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the refund",
    });
  }
};
