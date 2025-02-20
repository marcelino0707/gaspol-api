const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount");
const Transaction = require("../models/transaction");
const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const Outlet = require("../models/outlet");
const {
  applyDiscountAndUpdateTotal,
  formatDate,
} = require("../utils/generalFunctions");
const moment = require("moment-timezone");

exports.getTransactions = async (req, res) => {
  const thisTimeNow = moment();
  try {
    const { outlet_id, is_success } = req.query;
    let transactions = [];
    const reportDate = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD");
    if (is_success == "true") {
      transactions = await Transaction.getAllByIsSuccess(outlet_id, reportDate);
    } else {
      transactions = await Transaction.getAllByOutletID(outlet_id);
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
          if (key === 'invoice_due_date' || key === 'updated_at') {
            filteredTransaction[key] = moment.tz(transaction[key], "Asia/Jakarta").format("dddd, D MMMM YYYY - HH:mm");
          } else {
            filteredTransaction[key] = transaction[key];
          }
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
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const {
    outlet_id,
    member_id,
    cart_id,
    customer_seat,
    customer_name,
    transaction_id,
    customer_cash,
    payment_type_id,
    delivery_type,
    delivery_note,
  } = req.body;

  const transaction = {};

  if(member_id) {
    transaction.member_id = member_id;
  }

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
    if (!cart) {
      return res.status(200).json({
        message: "Keranjang Kosong!" || error.message || "Failed to fetch carts",
        data: null,
      });
    }

    if (customer_cash) {
      if (customer_cash < cart.total) {
        const errorMessage = "Uang anda kurang boss!";
        throw { statusCode: 400, message: errorMessage };
      }

      // add discount name for transaction
      if (cart.discount_id > 0) {
        transaction.discount_name = cart.discount_code; 
      }

      transaction.customer_cash = customer_cash;
      transaction.customer_change = customer_cash - cart.total;
      transaction.payment_type_id = payment_type_id;
      transaction.invoice_number =
        "INV-" +
        thisTimeNow.tz("Asia/Jakarta").format("YYYYMMDD-HHmmss") +
        payment_type_id;
      transaction.invoice_due_date = indoDateTime;
    }

    let existingTransaction = await Transaction.getByCartId(cart_id);
    if (!transaction_id && !existingTransaction) {
      transaction.receipt_number =
        "AT-" +
        customer_name +
        "-" +
        customer_seat +
        "-" +
        thisTimeNow.tz("Asia/Jakarta").format("YYYYMMDD-HHmmss");
      transaction.outlet_id = outlet_id;
      transaction.cart_id = cart_id;
      const createdTransaction = await Transaction.create(transaction);
      existingTransaction = await Transaction.getById(
        createdTransaction.insertId
      );
    } else {
      const transactionId = transaction_id
        ? transaction_id
        : existingTransaction.id;
      transaction.updated_at = indoDateTime;
      await Transaction.update(transactionId, transaction);
      existingTransaction = await Transaction.getById(transactionId);
    }

    let cartDetails, canceledItems, kitchenBarCartDetails, kitchenBarCanceledItems = [];
    const cartId = cart_id ? cart_id : existingTransaction.cart_id;
    if (customer_cash) {
      cartDetails = await CartDetail.getByCartId(cartId, true);
      kitchenBarCartDetails = await CartDetail.getNotOrderedByCartId(cartId);
      kitchenBarCanceledItems = await CartDetail.getCanceledByCartId(cartId);

      // add discount names for transaction
      if ((cart.discount_id == 0 || cart.discount_id == null) && cart.total != cart.subtotal) {
        let discountNames = [];
        for (const cartDetail of cartDetails) {
          discountNames.push(cartDetail.discount_code);
        }
        const transactionId = transaction_id
        ? transaction_id
        : existingTransaction.id;
        if (discountNames.length > 0) {
          let discountNameString = discountNames.join(', ').replace(/,\s$/, '');
          await Transaction.update(transactionId, {
            discount_name: discountNameString
          });
        }
      }
    } else {
      cartDetails = await CartDetail.getNotOrderedByCartId(cartId);
      canceledItems = await CartDetail.getCanceledByCartId(cartId);
      kitchenBarCartDetails = cartDetails;
      kitchenBarCanceledItems = canceledItems;
      if(canceledItems.length > 0) {
        const cartDetailIds = [
          ...new Set(canceledItems.map((cartDetail) => cartDetail.cart_detail_id)),
        ];
        await CartDetail.updateAllByCartDetailId(cartDetailIds, {
          is_cancel_printed : 1
        });
      }
    }

    await Cart.update(cart_id, {
      is_active: false,
      is_queuing: false,
    });

    await CartDetail.updateAllByCartId(cart_id, {
      is_ordered: 1,
    });

    const outlet = await Outlet.getByOutletId(outlet_id);

    let customerName = existingTransaction.customer_name;
    if (customer_name) {
      customerName = customer_name;
    }

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      outlet_phone_number: outlet.phone_number,
      outlet_footer: outlet.footer,
      transaction_id: existingTransaction.id,
      receipt_number: existingTransaction.receipt_number,
      customer_name: customerName,
      customer_seat: existingTransaction.customer_seat,
      payment_type: existingTransaction.payment_type,
      payment_category: existingTransaction.payment_category,
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
      canceled_items: canceledItems,
      kitchenBarCartDetails: kitchenBarCartDetails,
      kitchenBarCanceledItems: kitchenBarCanceledItems,
    };

    if(existingTransaction.member_name) {
      result.member_name = existingTransaction.member_name;
      const memberPhoneNumber = existingTransaction.member_phone_number;
      result.member_phone_number = "*****" + memberPhoneNumber.slice(-4);
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
    } else {
      result.is_refund_all = false;
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
  const { is_struct, is_report } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    let cartDetails = [];
    if(is_report == "true") {
      cartDetails = await CartDetail.getReportByCartId(transaction.cart_id);
    } else {
      cartDetails = await CartDetail.getByCartId(transaction.cart_id, true);
    }
    const refund = await Refund.getByTransactionId(id);
    let refundDetails = [];
    if (refund) {
      refundDetails = await RefundDetail.getByRefundId(refund.id);
    }
    let canceledItems = [];
    const getCanceledItems = await CartDetail.getCanceledByCartIdStructChecker(cart.id);
    if(getCanceledItems.length > 0) {
      canceledItems = getCanceledItems;
    }

    const result = {
      transaction_id: transaction.id,
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      payment_type: transaction.payment_type,
      payment_category: transaction.payment_category,
      cart_id: transaction.cart_id,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_id: cart.discount_id,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetails,
      canceled_items: canceledItems,
    };

    if(transaction.member_name) {
      result.member_name = transaction.member_name;
      const memberPhoneNumber = transaction.member_phone_number;
      result.member_phone_number = "*****" + memberPhoneNumber.slice(-4);
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

    result.is_refund_all = false;
    result.total_refund = null;
    result.refund_all_reason = null;
    result.refund_payment_type_all_name = null;
    result.refund_details = [];
    if (refund) {
      result.refund_payment_type_all_name = refund.refund_payment_type_all_name;
      result.refund_all_reason = refund.refund_reason;
      result.is_refund_all = refund.is_refund_all;
      result.total_refund = refund.total_refund;
      const refundDetailsWithoutId = refundDetails.map((detail) => {
        const { id, ...detailWithoutId } = detail;
        return detailWithoutId;
      });
      result.refund_details = refundDetailsWithoutId;
    }

    let transactionDateShow = transaction.updated_at;
    if (transaction.invoice_number != null) {
      transactionDateShow = transaction.invoice_due_date;
      result.status = "Paid";
    } else {
      result.status = "Pending";
    }
    
    if (refund && refund.is_refund_all == 1) {
      result.status = "Refunded";
    } else if (cart.is_canceled == 1) {
      result.status = "Canceled";
    }

    result.transaction_date_show = moment(transactionDateShow).locale('id').format("dddd, YYYY-MM-DD HH:mm:ss");

    if (
      is_report == undefined &&
      transaction.invoice_number == null &&
      (is_struct != true || is_struct != 1)
    ) {
      const isActivedCart = await Cart.getActiveCartId(cart.outlet_id);
      if (isActivedCart && isActivedCart.id != transaction.cart_id) {
        const isSavedTransaction = await Transaction.getByCartId(isActivedCart.id)
        if(isSavedTransaction == undefined || isSavedTransaction == null) {
          await Cart.update(isActivedCart.id, {
            is_queuing: true,
          })
        }
        await Cart.update(isActivedCart.id, {
          is_active: false,
        });
      }
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

exports.createDiscountTransaction = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const { cart_id, discount_id } = req.body;
  try {
    const cart = await Cart.getByCartId(cart_id);
    if (cart.discount_id == discount_id) {
      return res.status(201).json({
        message: "Diskon sudah terpasang!",
      });
    }

    // delete all discount from discounted cart detail
    const discountedCartDetails = await CartDetail.getDiscountedItemsByCartId(cart_id);
    if(discountedCartDetails.length != 0) {
      for (const cartDetail of discountedCartDetails) {
        await CartDetail.update(cartDetail.cart_detail_id, {
          discount_id: 0,
          discounted_price: 0,
          total_price: cartDetail.subtotal_price,
          updated_at: indoDateTime,
        });
      }
    }

    if (discount_id == 0 && cart.discount_id > 0) {
      await Cart.update(cart_id, {
        discount_id: discount_id,
        total: cart.subtotal,
        updated_at: indoDateTime,
      });

      return res.status(201).json({
        message: "Diskon berhasil dihapus!",
      });
    } else if (discount_id > 0) {
      const discount = await Discount.getById(discount_id);
      const totalCartPrice = await applyDiscountAndUpdateTotal(
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
    } else {
      return res.status(201).json({
        message: "Diskon-diskon berhasil dihapus!",
      });
    }
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

exports.createTransactionsOutlet = async (req, res) => {
  try {
    const { data } = req.body;
    const { outlet_id } = req.query;

    for (const cart of data) {
      if(cart.is_edited_sync == 0) {
        let newCart = {};
        newCart.outlet_id = outlet_id;
        newCart.subtotal = cart.subtotal;
        newCart.total = cart.total;
        newCart.created_at = cart.created_at; // string
        newCart.updated_at = cart.updated_at; // string
        
        const createdCart = await Cart.create(newCart);
        const cartId = createdCart.insertId;
  
        const newTransaction = {
          outlet_id: outlet_id,
          cart_id: cartId,
          transaction_ref: cart.transaction_ref,
          receipt_number: cart.receipt_number,
          invoice_number: cart.invoice_number,
          invoice_due_date: cart.invoice_due_date, // string
          payment_type_id: cart.payment_type_id,
          customer_cash: cart.customer_cash,
          customer_change: cart.customer_change,
          customer_name: cart.customer_name,
          customer_seat: cart.customer_seat,
          created_at: cart.created_at, // string
          updated_at: cart.invoice_due_date, // string
        }
  
        const createdTransaction = await Transaction.create(newTransaction);
        const transactionId = createdTransaction.insertId;
  
        const newCartDetails = cart.cart_details.map(item => ({
          cart_id: cartId,
          ref_refund_detail_id: item.cart_detail_id,
          menu_id : item.menu_id,
          menu_detail_id : item.menu_detail_id,
          serving_type_id: item.serving_type_id,
          price : item.price,
          subtotal_price: item.subtotal_price,
          total_price: item.total_price,
          qty: item.qty,
          note_item: item.note_item,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        
        await CartDetail.bulkCreate(newCartDetails);
  
        if(cart.refund_details && cart.refund_details.length > 0) {
          let newRefund = {
            transaction_id: transactionId,
            is_refund_type_all: 0, // refund type all
            is_refund_all: 0, // refund all after card details already empty
            created_at: cart.created_at, // string
            updated_at: cart.updated_at, // string
          }
  
          if(cart.is_refund_all == 1 ) {
            newRefund.is_refund_type_all = 1;
            newRefund.payment_type_id_all = cart.refund_payment_id_all;
            newRefund.refund_reason = cart.refund_reason_all;
            newRefund.total_refund = cart.total_refund;
            newRefund.created_at = cart.refund_created_at_all;
            newRefund.updated_at = cart.refund_created_at_all;
          }
  
          if(cart.total == 0 && cart.total_refund != 0) {
            newRefund.is_refund_all = 1;
          }
  
          const createdRefund = await Refund.create(newRefund);
          const refundId = createdRefund.insertId;
  
          const refCartDetail = await CartDetail.getRefRefundDetailsByCartId(cartId);
          const newRefundDetails = cart.refund_details.map(item => ({
            refund_id: refundId,
            cart_detail_id: refCartDetail.find(refItem => refItem.ref_refund_detail_id == item.cart_detail_id)?.cart_detail_id,
            qty_refund_item: item.refund_qty,
            refund_reason_item: item.refund_reason_item,
            payment_type_id: item.refund_payment_type_id_item,
            total_refund_price: item.refund_total,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
  
          await RefundDetail.bulkCreate(newRefundDetails);  
        }
      } else {
        // Edit Transaction
        const transactionData = await Transaction.getDataByTransactionReference(cart.transaction_ref);

        await Transaction.update(transactionData.transaction_id, {
          updated_at: cart.updated_at,
        });

        await Cart.update(transactionData.cart_id, {
          subtotal: cart.subtotal,
          total: cart.total,
          updated_at: cart.updated_at,
        });

        const refDetailIds = await CartDetail.getRefDetailIdsByCardId(transactionData.cart_id);
        const refundDetailIdsArray = refDetailIds.map((item) => item.ref_refund_detail_id);

        for (const cartDetail of cart.cart_details) {
          // edit cart details
          if (refundDetailIdsArray.includes(cartDetail.cart_detail_id)) {
            await CartDetail.updateByRefRefundDetailId(cartDetail.cart_detail_id, {
              subtotal_price: cartDetail.subtotal_price,
              total_price: cartDetail.total_price,
              qty: cartDetail.qty,
              updated_at: cartDetail.updated_at,
            });
          } else {
            // add new cart details
            await CartDetail.create({
              cart_id: transactionData.cart_id,
              ref_refund_detail_id: cartDetail.cart_detail_id,
              menu_id : cartDetail.menu_id,
              menu_detail_id : cartDetail.menu_detail_id,
              serving_type_id: cartDetail.serving_type_id,
              price : cartDetail.price,
              subtotal_price: cartDetail.subtotal_price,
              total_price: cartDetail.total_price,
              qty: cartDetail.qty,
              note_item: cartDetail.note_item,
              created_at: cartDetail.created_at,
              updated_at: cartDetail.updated_at,
            });
          }
        }

        // Edit Refund
        if (cart.refund_details && cart.refund_details.length > 0) {
          const haveRefund = await Refund.getExistRefundByTransactionId(transactionData.transaction_id);
          let refundId = haveRefund.id;
          if (haveRefund)
          {
            // Edit Refund
            await Refund.update(refundId, {
              is_refund_type_all: cart.is_refund_all == 1 ? 1 : 0,
              is_refund_all: cart.total == 0 ? 1 : 0,
              payment_type_id_all: cart.refund_payment_id_all? cart.refund_payment_id_all : null,
              refund_reason: cart.refund_reason_all? cart.refund_reason_all : null,
              total_refund: cart.total_refund,
              updated_at: cart.refund_created_at_all? cart.refund_created_at : cart.updated_at,
            })

          } else {
            // Add Refund
            // Tidak Clean Code
            let newRefund = {
              transaction_id: transactionData.transaction_id,
              is_refund_type_all: 0, // refund type all
              is_refund_all: 0, // refund all after card details already empty
              created_at: cart.created_at, // string
              updated_at: cart.updated_at, // string
            }
    
            if(cart.is_refund_all == 1 ) {
              newRefund.is_refund_type_all = 1;
              newRefund.payment_type_id_all = cart.refund_payment_id_all;
              newRefund.refund_reason = cart.refund_reason_all;
              newRefund.total_refund = cart.total_refund;
              newRefund.created_at = cart.refund_created_at_all;
              newRefund.updated_at = cart.refund_created_at_all;
            }
    
            if(cart.total == 0 && cart.total_refund != 0) {
              newRefund.is_refund_all = 1;
            }

            const createdRefund = await Refund.create(newRefund);

            refundId = createdRefund.insertId;
          }

          const refCartDetail = await CartDetail.getRefRefundDetailsByCartId(transactionData.cart_id);
          const newRefundDetails = cart.refund_details.map(item => ({
            refund_id: refundId,
            cart_detail_id: refCartDetail.find(refItem => refItem.ref_refund_detail_id == item.cart_detail_id)?.cart_detail_id,
            qty_refund_item: item.refund_qty,
            refund_reason_item: item.refund_reason_item,
            payment_type_id: item.refund_payment_type_id_item,
            total_refund_price: item.refund_total,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
  
          await RefundDetail.bulkCreate(newRefundDetails);  
        }
      }      
    };

    return res.status(201).json({
      message: "Transaksi outlet berhasil ditambahkan!",
      code: 201,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the transactions for outlet",
      code: 500
    })
  }
}
