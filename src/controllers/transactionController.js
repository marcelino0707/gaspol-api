const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount");
const Transaction = require("../models/transaction");
const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const {
  applyDiscountAndUpdateTotal,
  formatDate,
  generateFormattedDate,
} = require("../utils/generalFunctions");
const moment = require("moment-timezone");
const thisTimeNow = moment();
const indoDateTime = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"); 

function formatYearMonthDay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

exports.getTransactions = async (req, res) => {
  try {
    const { outlet_id, is_success, tanggal } = req.query;
    let transactions = [];
    let reportDate;
    if (tanggal) {
      reportDate = tanggal;
    } else {
      reportDate = indoDateTime.format("YYYY-MM-DD");
    }

    if (is_success == "true") {
      transactions = await Transaction.getAllByIsSuccess(outlet_id, reportDate);
    } else {
      transactions = await Transaction.getAllByOutletID(outlet_id, reportDate);
    }

    const filteredTransactions = transactions.map((transaction) => {
      const filteredTransaction = {};

      for (const key in transaction) {
        if (
          transaction[key] !== null &&
          transaction[key] !== "" &&
          transaction[key] !== "0.00" &&
          transaction[key] !== 0
        ) {
          filteredTransaction[key] = transaction[key];
        }
      }

      return filteredTransaction;
    });
    return res.status(200).json({
      data: filteredTransactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch transactions",
    });
  }
};

exports.createTransaction = async (req, res) => {
  const {
    outlet_id,
    cart_id,
    customer_seat,
    customer_name,
    transaction_id,
    customer_cash,
    payment_type,
    delivery_type,
    delivery_note,
  } = req.body;

  const transaction = {};

  if (customer_name) {
    transaction.customer_name = customer_name;
  }

  if (customer_seat) {
    transaction.customer_seat = customer_seat;
  }

  if (delivery_type) {
    transaction.delivery_type = delivery_type;
    transaction.delivery_note = delivery_note;
  }

  try {
    const cart = await Cart.getByCartId(cart_id);
    if (customer_cash) {
      if (customer_cash < cart.total) {
        const errorMessage = "Uang anda kurang boss!";
        throw { statusCode: 400, message: errorMessage };
      }
      transaction.customer_cash = customer_cash;
      transaction.customer_change = customer_cash - cart.total;
      transaction.payment_type = payment_type;
      transaction.invoice_number =
        "INV-" + generateTimeNow() + "-" + payment_type;
      transaction.invoice_due_date = generateFormattedDate();
    }

    let existingTransaction = await Transaction.getByCartId(cart_id);
    if (!transaction_id && !existingTransaction) {
      transaction.receipt_number =
        "AT-" + customer_name + "-" + customer_seat + "-" + generateTimeNow();
      transaction.outlet_id = outlet_id;
      transaction.cart_id = cart_id;
      const createdTransaction = await Transaction.create(transaction);
      existingTransaction = await Transaction.getById(
        createdTransaction.insertId
      );
    } else if (transaction_id) {
      await Transaction.update(transaction_id, transaction);
    } else if (existingTransaction) {
      await Transaction.update(existingTransaction.id, transaction);
    }

    await Cart.update(cart_id, {
      is_active: false,
    });

    const cartDetails = await CartDetail.getByCartId(
      existingTransaction.cart_id
    );

    const result = {
      transaction_id: existingTransaction.id,
      receipt_number: existingTransaction.receipt_number,
      customer_name: existingTransaction.customer_name,
      customer_seat: existingTransaction.customer_seat,
      payment_type: existingTransaction.payment_type,
      delivery_type: existingTransaction.delivery_type,
      delivery_note: existingTransaction.delivery_note,
      cart_id: existingTransaction.cart_id,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_id: cart.discount_id,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetails,
    };

    if (transaction.delivery_type || existingTransaction.delivery_type) {
      result.delivery_type =
        transaction.delivery_type || existingTransaction.delivery_type;
      result.delivery_note =
        transaction.delivery_note || existingTransaction.delivery_note;
    }

    if (transaction.invoice_number || existingTransaction.invoice_due_date) {
      result.customer_cash =
        transaction.customer_cash || existingTransaction.customer_cash;
      result.customer_change =
        transaction.customer_change || existingTransaction.customer_change;
      const tanggalWaktu =
        transaction.invoice_due_date || existingTransaction.invoice_due_date;
      result.invoice_due_date = formatDate(tanggalWaktu);
    }

    const refund = await Refund.getByTransactionId(existingTransaction.id);
    if (refund) {
      const refundDetails = await RefundDetail.getByRefundId(refund.id);
      result.is_refund_all = refund.is_refund_all;
      result.refund_reason = refund.refund_reason;
      result.total_refund = refund.total_refund;
      const refundDetailsWithoutId = refundDetails.map((detail) => {
        const { id, ...detailWithoutId } = detail;
        return detailWithoutId;
      });
      result.refund_details = refundDetailsWithoutId;
    }

    return res.status(201).json({
      code: 201,
      message: "Transaksi Sukses!",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage =
      error.message || "Some error occurred while creating the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.getById(id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);
    const refund = await Refund.getByTransactionId(id);
    let refundDetails = [];
    if (refund) {
      refundDetails = await RefundDetail.getByRefundId(refund.id);
    }
    const result = {
      transaction_id: transaction.id,
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      payment_type: transaction.payment_type,
      cart_id: transaction.cart_id,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_id: cart.discount_id,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetails,
    };

    if (transaction.delivery_type) {
      result.delivery_type = transaction.delivery_type;
      result.delivery_note = transaction.delivery_note;
    }

    if (transaction.invoice_number) {
      result.customer_cash = transaction.customer_cash;
      result.customer_change = transaction.customer_change;
      result.invoice_number = transaction.invoice_number;
      result.invoice_due_date = formatDate(transaction.invoice_due_date);
    }

    if (refund) {
      result.is_refund_all = refund.is_refund_all;
      result.refund_reason = refund.refund_reason;
      result.total_refund = refund.total_refund;
      const refundDetailsWithoutId = refundDetails.map((detail) => {
        const { id, ...detailWithoutId } = detail;
        return detailWithoutId;
      });
      result.refund_details = refundDetailsWithoutId;
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

// exports.deleteTransaction = async (req, res) => {
//   try {
//     const transactionId = req.params.id;

//     await Transaction.delete(transactionId, deletedAtNow);

//     return res.status(200).json({
//       message: "Berhasil menghapus data transaksi",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Error while deleting menu",
//     });
//   }
// };

function generateTimeNow() {
  const now = indoDateTime;
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const thisTime = `${year}${month}${day}-${hours}${minutes}${seconds}`;

  return thisTime;
}

exports.createDiscountTransaction = async (req, res) => {
  const { cart_id, discount_id } = req.body;
  try {
    const cart = await Cart.getByCartId(cart_id);
    if (cart.discount_id == discount_id) {
      return res.status(201).json({
        message: "Diskon sudah terpasang!",
      });
    }

    const discount = await Discount.getById(discount_id);
    totalCartPrice = await applyDiscountAndUpdateTotal(
      null,
      null,
      discount.is_percent,
      discount.value,
      discount.min_purchase,
      discount.max_discount,
      discount.is_discount_cart,
      cart.subtotal
    );
    await Cart.update(cart_id, {
      discount_id: discount_id,
      total: totalCartPrice,
      updated_at: indoDateTime,
    });
    return res.status(201).json({
      message: "Diskon berhasil ditambahkan!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage =
      error.message ||
      "Some error occurred while creating the discount for transaction";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};
