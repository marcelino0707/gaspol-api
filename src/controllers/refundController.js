const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const CartDetail = require("../models/cart_detail");
const Transaction = require("../models/transaction");
const Cart = require("../models/cart");
const { formatDate } = require("../utils/generalFunctions");
const moment = require("moment-timezone");

exports.createRefund = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const { transaction_id, is_refund_all, cart_id, refund_reason, cart_details, payment_type_id } = req.body;
    const refund = await Refund.getByTransactionId(transaction_id);

    if(refund && refund.is_refund_all == 1) {
      return res.status(200).json({
        message: "Tidak ada transaksi yang bisa direfund lagi!",
      });
    }

    let refundId,
      totalRefund = 0;
    if (refund) {
      refundId = refund.id;
      totalRefund = refund.total_refund;
    } else {
      const newRefund = {
        transaction_id: transaction_id,
        is_refund_all: is_refund_all,
      };

      if(is_refund_all === true) {
        newRefund.payment_type_id_all = payment_type_id;
        newRefund.is_refund_type_all = 1;
        newRefund.is_refund_all = 1;
        newRefund.refund_reason = refund_reason;
      }
      const createdRefund = await Refund.create(newRefund);
      refundId = createdRefund.insertId;
    }

    if (is_refund_all === true) {
      const cart = await Cart.getByCartId(cart_id);
      const cartDetails = await CartDetail.getByCartId(cart_id, true);
      for (const cartDetail of cartDetails) {
        const refundDetailData = {
          refund_id: refundId,
          cart_detail_id: cartDetail.cart_detail_id,
          qty_refund_item: cartDetail.qty,
          total_refund_price: cartDetail.total_price,
          refund_reason_item: refund_reason,
          payment_type_id: payment_type_id,
        };

        await RefundDetail.create(refundDetailData);

        await CartDetail.update(cartDetail.cart_detail_id, {
          qty: 0,
          total_price: 0,
        });
      }
      totalRefund = cart.total;
    } else {
      for (const cartDetail of cart_details) {
        const oldCartDetail = await CartDetail.getByCartDetailId(cartDetail.cart_detail_id);
        
        let totalRefundPrice = 0;
        let oldCartDetailPrice;
        if (oldCartDetail.discount_id == null || oldCartDetail.discount_id == 0) {
          oldCartDetailPrice = oldCartDetail.price;
          totalRefundPrice = cartDetail.qty_refund * oldCartDetail.price;
        } else {
          oldCartDetailPrice = oldCartDetail.discounted_price;
          totalRefundPrice = cartDetail.qty_refund == oldCartDetail.qty ? oldCartDetail.total_price : cartDetail.qty_refund * oldCartDetail.discounted_price;
        }
        
        const qtyUpdate = oldCartDetail.qty - cartDetail.qty_refund;
        const totalPriceUpdate = qtyUpdate * oldCartDetailPrice;
        await CartDetail.update(cartDetail.cart_detail_id, {
          qty: qtyUpdate,
          total_price: oldCartDetail.qty != cartDetail.qty_refund ? totalPriceUpdate : 0,
        });

        await RefundDetail.create({
          refund_id: refundId,
          cart_detail_id: cartDetail.cart_detail_id,
          qty_refund_item: cartDetail.qty_refund,
          total_refund_price: totalRefundPrice,
          refund_reason_item: refund_reason,
          payment_type_id: payment_type_id,
        });
        totalRefund = totalRefund + totalRefundPrice;
      }
    }

    const cartDetails = await CartDetail.getByCartId(cart_id, true);

    const refundUpdate = {
      total_refund: totalRefund,
      updated_at: indoDateTime,
    }

    let refundAll = true;
    for (const cartDetail of cartDetails){
      if (cartDetail.qty != 0) {
        refundAll = false;
      }
    }

    if(refundAll) {
      refundUpdate.is_refund_all = true;
    }

    await Refund.update(refundId, refundUpdate);
    await Transaction.update(transaction_id, {
      updated_at: indoDateTime
    });

    const transaction = await Transaction.getByCartId(cart_id);
    const cart = await Cart.getByCartId(cart_id);
    const refundResult = await Refund.getByTransactionId(transaction_id);
    const refundDetailsResult = await RefundDetail.getByRefundId(refundId);
    
    const result = {
      transaction_id: transaction.id,
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      payment_type: transaction.payment_type,
      payment_category: transaction.payment_category,
      delivery_type: transaction.delivery_type,
      delivery_note: transaction.delivery_note,
      cart_id: transaction.cart_id,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_id: cart.discount_id,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetails,
    };

    if(transaction.delivery_type) {
      result.delivery_type = transaction.delivery_type;
      result.delivery_note = transaction.delivery_note;
    }

    if (transaction.invoice_number) {
      result.customer_cash = transaction.customer_cash;
      result.customer_change = transaction.customer_change;
      const tanggalWaktu = transaction.invoice_due_date;
      result.invoice_due_date = formatDate(tanggalWaktu);
    }

    result.is_refund_all = refundResult.is_refund_all;
    result.refund_reason = refundResult.refund_reason;
    result.total_refund = refundResult.total_refund;
    const refundDetailsWithoutId = refundDetailsResult.map((detail) => {
      const { id, ...detailWithoutId } = detail;
      return detailWithoutId;
    });
    result.refund_details = refundDetailsWithoutId;

    return res.status(201).json({
      message: "Refund berhasil dilakukan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the refund",
    });
  }
};
