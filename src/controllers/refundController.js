const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
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

    if (is_refund_all === true) {
      const cartDetails = await CartDetail.getByCartId(cart_id);
      const refundDetails = await RefundDetail.getByRefundId(refundId);

      if (refundDetails) {
        for (const cartDetail of cartDetails) {
          for (const refundDetail of refundDetails) {
            if (cartDetail.cart_detail_id == refundDetail.cart_detail_id) {
              const updateQtyRefund = cartDetail.qty + refundDetail.qty_refund_item;
              const refundDetailData = {
                qty_refund_item: updateQtyRefund,
                total_refund_price: cartDetail.total_price,
              };

              if (cartDetail.discount_id === null || cartDetail.discount_id == 0) {
                refundDetailData.total_refund_price = updateQtyRefund * cartDetail.price;
              } else {
                refundDetailData.total_refund_price = updateQtyRefund * cartDetail.discounted_price;
              }
              await RefundDetail.update(refundDetail.id, refundDetailData);

              totalRefund = totalRefund + refundDetailData.total_refund_price;

              await Refund.update(refundId, {
                total_refund_price: totalRefund,
              });

              await CartDetail.update(cartDetail.cart_detail_id, {
                qty: 0,
                total_price: 0,
              });
            }
          }
        }
      } else {
        for (const cart_detail of cartDetails) {
          const refundDetailData = {
            refund_id: refundId,
            cart_detail_id: cart_detail.cart_detail_id,
            qty_refund_item: cart_detail.qty,
          };

          if (isNaN(cart_detail.discount_id) || cart_detail.discount_id == 0) {
            refundDetailData.total_refund_price = cart_detail.qty * cart_detail.price;
          } else {
            refundDetailData.total_refund_price = cart_detail.qty * cart_detail.discounted_price;
          }
          await RefundDetail.create(refundDetailData);

          await CartDetail.update(cart_detail.cart_detail_id, {
            qty: 0,
            total_price: 0,
          });
        }

        const cart = await Cart.getByCartId(cart_id);
        totalRefund = cart.total;
      }
      await Cart.update(cart_id, {
        total: 0,
      });

      await Refund.update(refundId, {
        total_refund_price: totalRefund,
        is_refund_all: true,
      });
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

        const refundDetailData = {
          refund_id: refundId,
          cart_detail_id: cartDetail.cart_detail_id,
          qty_refund_item: cartDetail.qty_refund,
          refund_reason_item: cartDetail.refund_reason,
        };

        if (cartDetails.discount_id === null || cartDetails.discount_id == 0) {
          refundDetailData.total_refund_price = cartDetail.qty_refund * cartDetails.price;
        } else {
          refundDetailData.total_refund_price = cartDetail.qty_refund * cartDetails.discounted_price;
        }
        await RefundDetail.create(refundDetailData);
        totalRefund = totalRefund + refundDetailData.total_refund_price;

        await Refund.update(refundId, {
          total_refund_price: totalRefund,
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
