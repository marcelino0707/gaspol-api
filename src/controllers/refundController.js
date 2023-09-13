const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const CartDetail = require("../models/cart_detail");
const Cart = require("../models/cart");

exports.createRefund = async (req, res) => {
  try {
    const { transaction_id, is_refund_all, cart_id, refund_reason, cart_details } = req.body;
    const refund = await Refund.getByTransactionId(transaction_id);
    // const cart = await Cart.getByCartId(cart_id);

    let refundId,
      totalRefund = 0;
      // totalCart = 0;
    if (refund) {
      refundId = refund.id;
      totalRefund = refund.total_refund;
      // totalCart = cart.total;
    } else {
      const newRefund = {
        transaction_id: transaction_id,
        is_refund_all: is_refund_all,
        refund_reason: refund_reason,
      };
      const createdRefund = await Refund.create(newRefund);
      refundId = createdRefund.insertId;
    }

    if (is_refund_all == true) {
      const cartDetails = await CartDetail.getByCartId(cart_id);
      const refundDetails = await RefundDetail.getByRefundId(refundId);

      if (refundDetails.length > 0) {
        for (const cartDetail of cartDetails) {
          const matchingRefundDetail = refundDetails.find(
            (refundDetail) => cartDetail.cart_detail_id == refundDetail.cart_detail_id
          );
          const updateQtyRefund = cartDetail.qty + (matchingRefundDetail ? matchingRefundDetail.qty_refund_item : 0);
          const totalRefundPrice = cartDetail.total_price + (matchingRefundDetail ? matchingRefundDetail.total_refund_price : 0);
          const refundReasonItem = matchingRefundDetail ? matchingRefundDetail.refund_reason_item : refund_reason;
          
          if (matchingRefundDetail) {
            await RefundDetail.update(matchingRefundDetail.id, {
              qty_refund_item: updateQtyRefund,
              total_refund_price: totalRefundPrice,
              refund_reason_item: refundReasonItem,
            });      
          } else {
            await RefundDetail.create({
              refund_id: refundId,
              cart_detail_id: cartDetail.cart_detail_id,
              qty_refund_item: cartDetail.qty,
              total_refund_price: totalRefundPrice,
            });
          }
          await CartDetail.update(cartDetail.cart_detail_id, {
            qty: 0,
            total_price: 0,
          });
        }
      } else {
        for (const cart_detail of cartDetails) {
          const refundDetailData = {
            refund_id: refundId,
            cart_detail_id: cart_detail.cart_detail_id,
            qty_refund_item: cart_detail.qty,
            total_refund_price: cart_detail.total_price,
            refund_reason_item: refund_reason,
          };
          
          await RefundDetail.create(refundDetailData);

          await CartDetail.update(cart_detail.cart_detail_id, {
            qty: 0,
            total_price: 0,
          });
        }
      }

      // totalCart = 0;
      totalRefund = totalRefund + cart.total;
    } else {
      if(cart_details) {
        const refundDetails = await RefundDetail.getByRefundId(refundId);
        for (const cartDetail of cart_details) {
          const oldCartDetail = await CartDetail.getByCartDetailId(cartDetail.cart_detail_id);
          const matchingRefundDetail = refundDetails.find(
            (refundDetail) => cartDetail.cart_detail_id == refundDetail.cart_detail_id
          );
          const updateQtyRefund = cartDetail.qty_refund + (matchingRefundDetail ? matchingRefundDetail.qty_refund_item : 0);
          
          let totalRefundPrice = 0
          if (oldCartDetail.discount_id == null || oldCartDetail.discount_id == 0) {
            totalRefundPrice = cartDetail.qty_refund * oldCartDetail.price;
          } else {
            totalRefundPrice = cartDetail.qty_refund * oldCartDetail.discounted_price;
          }
          totalRefundPrice = totalRefundPrice + (matchingRefundDetail ? matchingRefundDetail.total_refund_price : 0);
          
          const qtyUpdate = oldCartDetail.qty - cartDetail.qty_refund;
          const totalPriceUpdate = qtyUpdate * oldCartDetail.price;
          await CartDetail.update(cartDetail.cart_detail_id, {
            qty: qtyUpdate,
            total_price: totalPriceUpdate,
          });
          
          const newRefundDetail = {
            refund_id: refundId,
            cart_detail_id: cartDetail.cart_detail_id,
            qty_refund_item: updateQtyRefund,
            total_refund_price: totalRefundPrice,
            refund_reason_item: cartDetail.refund_reason_item,
          };

          if (!matchingRefundDetail || matchingRefundDetail.refund_reason_item != cartDetail.refund_reason_item) {
            await RefundDetail.create(newRefundDetail);
          } else {
            await RefundDetail.update(matchingRefundDetail.id, {
              qty_refund_item: updateQtyRefund,
              total_refund_price: totalRefundPrice,
            });
          }
  
          // totalCart = totalCart - totalRefundPrice;
          totalRefund = totalRefund + totalRefundPrice;
        }
      }
    }

    // await Cart.update(cart_id, {
    //   total: totalCart,
    // });

    await Refund.update(refundId, {
      total_refund: totalRefund,
    });

    return res.status(201).json({
      message: "Refund berhasil dilakukan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the refund",
    });
  }
};
