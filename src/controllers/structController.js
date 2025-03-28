const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Transaction = require("../models/transaction");
const Refund = require("../models/refund");
const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");
const RefundDetail = require("../models/refund_detail");
const ServingType = require("../models/serving_type");
const Outlet = require("../models/outlet");
const Expenditure = require("../models/expenditure");
const PaymentType = require("../models/payment_type");
const ShiftReport = require("../models/shift_report");
const logger = require('../utils/logger');
const moment = require("moment-timezone");

exports.getCustomerStruct = async (req, res) => {
  const { id } = req.params;
  // const { outlet_id } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(transaction.outlet_id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id, true);
    const refund = await Refund.getByTransactionId(id);
    let refundDetails = [];
    if (refund) {
      refundDetails = await RefundDetail.getByRefundId(refund.id);
    }
    const cartDetailsWithoutId = cartDetails.map((detail) => {
      const {
        cart_detail_id,
        menu_id,
        menu_detail_id,
        discount_id,
        serving_type_id,
        ...detailWithoutId
      } = detail;
      return detailWithoutId;
    });

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      outlet_phone_number: outlet.phone_number,
      outlet_footer: outlet.footer,
      date_time: transaction.invoice_due_date.toGMTString(),
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetailsWithoutId,
    };

    if(transaction.member_name) {
      result.member_name = transaction.member_name;
      const memberPhoneNumber = transaction.member_phone_number;
      result.member_phone_number = "*****" + memberPhoneNumber.slice(-4);
    };

    if (refund) {
      const refundDetailsWithoutId = refundDetails.map((detail) => {
        const { id, cart_detail_id, ...detailWithoutId } = detail;
        return detailWithoutId;
      });
      result.is_refund_all = refund.is_refund_all;
      result.refund_reason = refund.refund_reason;
      result.refund_details = refundDetailsWithoutId;
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
  const { id } = req.params;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(transaction.outlet_id);
    const cartDetails = await CartDetail.getByCartId(
      transaction.cart_id,
      false
    );

    let updatedCartDetails = [];

    for (const cartDetail of cartDetails) {
      const menus = await Menu.getById(cartDetail.menu_id);
      const menuDetail = await MenuDetail.getAllByMenuID(menus.id);
      const servingType = await ServingType.getServingTypeById(
        cartDetail.serving_type_id
      );
      const data = {
        menu_name: menus.name,
        menu_type: menus.menu_type,
        varian: menuDetail.varian,
        serving_type_name: servingType.name,
        qty: cartDetail.qty,
        note_item: cartDetail.note_item,
      };
      updatedCartDetails.push(data);
    }

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      date_time: transaction.invoice_due_date.toGMTString(),
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      delivery_type: transaction.delivery_type,
      delivery_note: transaction.delivery_note,
      cart_details: updatedCartDetails,
    };

    if (
      transaction.delivery_type == null &&
      transaction.delivery_note == null
    ) {
      result.delivery_type = "null";
      result.delivery_note = "null";
    }

    return res.status(200).json({
      code: 200,
      message: "Cart Kitchen berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

exports.getShiftStruct = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const indoDateTimeNow = thisTimeNow.tz("Asia/Jakarta");
  const today = moment().tz("Asia/Jakarta");

  const { outlet_id, actual_ending_cash, casher_name } = req.body;
  try {
    function getStartDate() {
      const startDate = today.set({
        hour: 6,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      return startDate.toDate();
    }

    const shiftReports = await ShiftReport.getLastCreated(outlet_id);
    let shiftNumber = 1;
    const startDate = shiftReports ? shiftReports.start_date : getStartDate();
    if (!shiftReports) {
      await ShiftReport.create({
        outlet_id: outlet_id,
        start_date: getStartDate(),
        shift_number: 1,
        end_date: indoDateTime,
        casher_name: casher_name,
        actual_ending_cash: actual_ending_cash,
      });
    } else {
      const shiftUpdateObj = {
        end_date: indoDateTime,
        casher_name: casher_name,
        actual_ending_cash: actual_ending_cash,
      }

      const shiftStartDate = moment(shiftReports.start_date).tz("Asia/Jakarta");

      if (
        (shiftStartDate.isSame(indoDateTimeNow, 'day') && shiftStartDate.hour() < 6 && indoDateTimeNow.hour() >= 6) ||
        (shiftStartDate.isBefore(indoDateTimeNow, 'day') && indoDateTimeNow.hour() >= 6)
      ) { 
        shiftUpdateObj.shift_number = 1; 
      } else {
        shiftNumber = shiftReports.shift_number;
      }
      await ShiftReport.update(shiftReports.id, shiftUpdateObj);
    }

    // generate start_date for next shift
    const nextShiftStartDate = moment(indoDateTime).add(1, "seconds").toDate();
    await ShiftReport.create({
      outlet_id: outlet_id,
      start_date: nextShiftStartDate,
      shift_number: shiftNumber + 1,
    });

    const startDateString = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
    const endDateString = moment(indoDateTime).format("YYYY-MM-DD HH:mm:ss");

    const outlet = await Outlet.getByOutletId(outlet_id);
    const expenditure = await Expenditure.getExpenseReport(
      outlet_id,
      startDateString,
      endDateString
    );
    const transactions = await Transaction.getShiftReport(
      outlet_id,
      startDateString,
      endDateString
    );

    // Get cartDetails & refundDetails data
    let cartDetails = [];
    if (transactions.length > 0) {
      const cartIds = [
        ...new Set(
          transactions.map((transaction) => transaction.cart_id)
        ),
      ];
      cartDetails = await CartDetail.getByCartIdsShift(cartIds);
    }

    // Separate cartDetails into cartDetailsSuccess, cartDetailsPending and cartDetailsCanceled
    const cartDetailsSuccess = cartDetails
      .filter((cart) => {
        const associatedTransaction = transactions.find(
          (transaction) =>
            transaction.cart_id === cart.cart_id &&
            transaction.invoice_number !== null
        );
        return !!associatedTransaction;
      })
      .filter((cart) => cart.total_price > 0 && (cart.is_canceled == null || cart.is_canceled == 0));

    const cartDetailsPending = cartDetails.filter((cart) => {
      const associatedTransaction = transactions.find(
        (transaction) =>
          transaction.cart_id === cart.cart_id &&
          transaction.invoice_number === null
      );

      const isCanceled = cart.is_canceled == null || cart.is_canceled == 0;

      return !!associatedTransaction && isCanceled;
    });

    const cartDetailsCanceled = cartDetails.filter((cart) => cart.is_canceled == 1);

    const payment_details = [];
    let totalCashSales = 0
    const payment_types = await PaymentType.getAll(outlet_id);
    const refundDetails = await RefundDetail.getShiftReport(outlet_id, startDateString, endDateString);
    const refundAllTransactions = await Refund.getShiftReport(outlet_id, startDateString, endDateString);

    // Iterate through each payment type
    for (const paymentType of payment_types) {
      // Get transactions related to the current payment type
      const transactionsByPaymentType = transactions.filter(
        (transaction) => transaction.payment_type_id === paymentType.id
      );

      // Calculate total amount for the current payment type
      const totalPayment = transactionsByPaymentType.reduce(
        (total, transaction) => total + transaction.total,
        0
      );
      
      if (paymentType.id != 1) {
        // Create payment type detail object
        const paymentTypeDetail = {
          payment_type: paymentType.name,
          total_payment: totalPayment,
          is_success: 1,
          is_refund: 0,
        };

        const refundTransactionByPaymentType = refundAllTransactions
        .filter((refund) => refund.payment_type_id == paymentType.id);

        const refundTransactionIds = refundTransactionByPaymentType
        .map((refund) => refund.id);

        const totalRefundTransaction = refundTransactionByPaymentType
        .reduce((total, refund) => total + refund.total_refund, 0);
        
        const totalRefundPerItemByPaymentType = refundDetails
          .filter((refund) => refund.payment_type_id == paymentType.id && !refundTransactionIds.includes(refund.refund_id))
          .reduce((total, refund) => total + refund.total_refund_price, 0);

        // Calculate total refund amount for the current payment type
        const totalRefund = totalRefundTransaction + totalRefundPerItemByPaymentType;

        // If there are refunds, add a new payment type detail for refunds
        if (totalRefund > 0) {
          const refundPaymentTypeDetail = {
            payment_type: `${paymentType.name} Refund`,
            total_payment: totalRefund,
            is_success: 0,
            is_refund: 1,
          };
          payment_details.push({
            payment_category: paymentType.payment_category_name,
            payment_type_detail: [paymentTypeDetail, refundPaymentTypeDetail],
            payment_category_id: paymentType.payment_category_id,
            total_amount: totalPayment - totalRefund,
          });
        } else {
          if (paymentTypeDetail.total_payment > 0) {
            // Find the payment category name
            const paymentCategoryName = payment_types.find(
              (pt) => pt.payment_category_id === paymentType.payment_category_id
            ).payment_category_name;

            // Check if a payment category with the same name already exists
            const existingPaymentCategory = payment_details.find(
              (pd) => pd.payment_category === paymentCategoryName
            );

            // If exists, push the payment type detail to existing payment category
            if (existingPaymentCategory) {
              existingPaymentCategory.payment_type_detail.push(
                paymentTypeDetail
              );
            } else {
              // If not exists, create a new payment category
              const newPaymentCategory = {
                payment_category: paymentCategoryName,
                payment_type_detail: [paymentTypeDetail],
                payment_category_id: paymentType.payment_category_id,
              };
              payment_details.push(newPaymentCategory);
            }
          }
        }
      } else {
        totalCashSales += totalPayment;
      }
    }

    // for Cash payment type
    const totalRefundedCashFromOtherPaymentWithRefundAll = refundAllTransactions
      .filter((refund) => refund.payment_type_id == 1)
      .reduce((total, refund) => total + refund.total_refund, 0 );

    const totalRefundedCashFromOtherPaymentWithNotRefundAll = refundDetails
      .filter((refund) => refund.payment_type_id == 1 && refund.is_refund_type_all == 0)
      .reduce((total, refund) => total + refund.total_refund_price, 0 );

    const totalCashRefunded = totalRefundedCashFromOtherPaymentWithRefundAll + totalRefundedCashFromOtherPaymentWithNotRefundAll;
    
    const paymentDetailsCash = {
      payment_category: "Cash Payment",
      payment_type_detail: [
        {
          payment_type: "Cash Sales",
          total_payment: totalCashSales,

          is_success: 1,
          is_refund: 0,
          is_pending: 0,
        },
        {
          payment_type: "Cash from Invoice",
          total_payment: cartDetailsPending.reduce(
            (total, cart) => total + cart.total_price,
            0
          ),
          is_success: 0,
          is_refund: 0,
          is_pending: 1,
        },
        {
          payment_type: "Cash Refund",
          // total_payment: totalCashRefund,
          total_payment: totalCashRefunded,
          is_success: 0,
          is_refund: 1,
          is_pending: 0,
        },
        {
          payment_type: "Cash Canceled",
          total_payment: cartDetailsCanceled.reduce(
            (total, cart) => total + cart.total_price,
            0
          ),
          is_success: 0,
          is_refund: 0,
          is_pending: 0,
        },
      ],
      payment_category_id: 1,
    };
    payment_details.unshift(paymentDetailsCash);

    // Calculate and add total_amount to each object in payment_details
    for (const paymentCategory of payment_details) {
      const totalSuccessPayment = paymentCategory.payment_type_detail
        .filter((pt) => pt.is_success === 1)
        .reduce((total, paymentType) => total + paymentType.total_payment, 0);

      const totalRefundPayment = paymentCategory.payment_type_detail
        .filter((pt) => pt.is_refund === 1)
        .reduce((total, paymentType) => total + paymentType.total_payment, 0);

      paymentCategory.total_amount = totalSuccessPayment - totalRefundPayment;
    }

    // Calculate subtotal_transaction
    const total_transaction = payment_details.reduce(
      (total, paymentCategory) => total + paymentCategory.total_amount,
      0
    );

    // merge & sum for same menu and same varian 
    const mergeAndSumCartDetails = (cartDetails, is_refund) => {
      const mergedCartDetails = [];

      cartDetails.forEach((cart) => {
        const existingCartItem = mergedCartDetails.find(
          (mergedCart) =>
            mergedCart.menu_id == cart.menu_id &&
            mergedCart.menu_detail_id == cart.menu_detail_id
        );

        if (existingCartItem) {
          if (is_refund) {
            existingCartItem.qty_refund_item += cart.qty_refund_item;
            existingCartItem.total_refund_price += cart.total_refund_price;
          } else {
            existingCartItem.qty += cart.qty;
            existingCartItem.total_price += cart.total_price;
          }
        } else {
          const newCartItem = {
            menu_id: cart.menu_id,
            menu_detail_id: cart.menu_detail_id,
            menu_name: cart.menu_name,
            varian: cart.varian,
            menu_type: cart.menu_type,
          };
          if (is_refund) {
            newCartItem.qty_refund_item = cart.qty_refund_item;
            newCartItem.total_refund_price = cart.total_refund_price;
          } else {
            newCartItem.qty = cart.qty;
            newCartItem.total_price = cart.total_price;
          }
          mergedCartDetails.push(newCartItem);
        }
      });

      return mergedCartDetails;
    };

    const cartDetailsSuccessFiltered = mergeAndSumCartDetails(cartDetailsSuccess, false);
    const cartDetailsPendingFiltered = mergeAndSumCartDetails(cartDetailsPending, false);
    const cartDetailsCanceledFiltered = mergeAndSumCartDetails(cartDetailsCanceled, false);
    const refundDetailsFiltered = mergeAndSumCartDetails(refundDetails, true);

    // Function to calculate sold_items, total_amount, discount_amount_transactions, and discount_amount_per_items
    function calculateSummary(
      cartDetailsSuccess,
      cartDetailsPending,
      cartDetailsCanceled,
      refundDetails,
      transactions,
      refundAllTransactions
    ) {
      // sum qty
      const totalSuccessQty = cartDetailsSuccess.reduce(
        (total, cart) => total + cart.qty,
        0
      );
      const totalPendingQty = cartDetailsPending.reduce(
        (total, cart) => total + cart.qty,
        0
      );
      const totalCanceledQty = cartDetailsCanceled.reduce(
        (total, cart) => total + cart.qty,
        0
      );
      const totalRefundQty = refundDetails.reduce(
        (total, refund) => total + refund.qty_refund_item,
        0
      );

      const subtotalCartRefundAmount = refundDetails.reduce(
        (total, cart) => total + (cart.price * cart.qty_refund_item),
        0
      );

      // sum total
      const totalCartSuccessAmount = cartDetailsSuccess.reduce(
        (total, cart) => total + cart.total_price,
        0
      );
      const totalCartPendingAmount = cartDetailsPending.reduce(
        (total, cart) => total + cart.total_price,
        0
      );
      const totalCartCanceledAmount = cartDetailsCanceled.reduce(
        (total, cart) => total + cart.total_price,
        0
      );
      const totalCartRefundAmount = refundDetails.reduce(
        (total, refund) => total + refund.total_refund_price,
        0
      );

      // sum total discount cart
      const transactionsIds = transactions
      .filter((transaction) => {
        return transaction.discount_id > 0 && transaction.invoice_number !== null;
      })
      .map((transaction) => transaction.transaction_id);

      const discountedRefundTransaction = refundAllTransactions
      .filter((refund) => {
        refund.discount_id > 0 && !transactionsIds.includes(refund.transaction_id)
      })
      .reduce((total, refund) => total + (refund.subtotal_cart - refund.total_refund), 0);

      const discountedTransactions = transactions
      .filter((transaction) => transaction.discount_id > 0 && transaction.invoice_number !== null)
      .reduce(
        (total, transaction) => total + (transaction.subtotal - transaction.total), 0);
      
      const discount_amount_transactions = discountedTransactions + discountedRefundTransaction;

      // sum total discount per item
      const totalDiscountedAmountPerSuccessItems = cartDetailsSuccess
      .filter((item) => item.discount_id > 0 || item.discount_id != null)
      .reduce((total, item) => total + (item.subtotal_price - item.total_price), 0);
      
      const discount_amount_per_items = totalDiscountedAmountPerSuccessItems + (subtotalCartRefundAmount - totalCartRefundAmount);
      
      return {
        totalSuccessQty,
        totalPendingQty,
        totalCanceledQty,
        totalRefundQty,
        totalCartSuccessAmount,
        totalCartPendingAmount,
        totalCartCanceledAmount,
        totalCartRefundAmount,
        discount_amount_transactions,
        discount_amount_per_items,
      };
    }

    const {
      totalSuccessQty,
      totalPendingQty,
      totalCanceledQty,
      totalRefundQty,
      totalCartSuccessAmount,
      totalCartPendingAmount,
      totalCartCanceledAmount,
      totalCartRefundAmount,
      discount_amount_transactions,
      discount_amount_per_items,
    } = calculateSummary(
      cartDetailsSuccess,
      cartDetailsPending,
      cartDetailsCanceled,
      refundDetails,
      transactions,
      refundAllTransactions
    );

    const discount_total_amount = discount_amount_per_items + discount_amount_transactions;
    const ending_cash_expected = totalCashSales - expenditure.totalExpense;
    const cash_difference = actual_ending_cash - ending_cash_expected;

    await ShiftReport.update(shiftReports.id, {
      cash_difference: cash_difference,
      expected_ending_cash: ending_cash_expected,
      total_discount: discount_total_amount,
      total_amount: total_transaction - discount_amount_transactions,
      updated_at: indoDateTime,
    });

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      outlet_phone_number: outlet.phone_number,
      casher_name: casher_name,
      shift_number: shiftNumber,
      start_date: startDateString,
      end_date: endDateString,

      expenditures: expenditure.lists,
      expenditures_total: expenditure.totalExpense,
      ending_cash_expected: ending_cash_expected,
      ending_cash_actual: actual_ending_cash ? actual_ending_cash : 0,
      cash_difference,

      discount_amount_transactions,
      discount_amount_per_items,
      discount_total_amount,

      cart_details_success: cartDetailsSuccessFiltered,
      totalSuccessQty,
      totalCartSuccessAmount,

      cart_details_pending: cartDetailsPendingFiltered,
      totalPendingQty,
      totalCartPendingAmount,

      cart_details_canceled: cartDetailsCanceledFiltered,
      totalCanceledQty,
      totalCartCanceledAmount,

      refund_details: refundDetailsFiltered,
      totalRefundQty,
      totalCartRefundAmount,

      payment_details,
      total_transaction: total_transaction,
    };

    return res.status(200).json({
      code: 200,
      message: "Struk shift berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    logger.error(`Error in outlet ${outlet_id}, getShiftStruct: ${error.stack}`);
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

exports.getLastShiftStruct = async (req, res) => {
  const { outlet_id } = req.query;
  try {
    const shiftReports = await ShiftReport.getLastShift(outlet_id);
    if (!shiftReports) {
      return res.status(200).json({
        message: "Laporan Kosong!",
        data: null,
      });
    } else {
      const actual_ending_cash = shiftReports.actual_ending_cash;
      const casher_name = shiftReports.casher_name;
      const shiftNumber = shiftReports.shift_number;
      const startDate = moment(shiftReports.start_date).tz("Asia/Jakarta");
      const endDate = moment(shiftReports.end_date).tz("Asia/Jakarta");
      const startDateString = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
      const endDateString = moment(endDate).format("YYYY-MM-DD HH:mm:ss");

      const outlet = await Outlet.getByOutletId(outlet_id);
      const expenditure = await Expenditure.getExpenseReport(
        outlet_id,
        startDateString,
        endDateString
      );
      const transactions = await Transaction.getShiftReport(
        outlet_id,
        startDateString,
        endDateString
      );
      let cartDetails = [];
      if (transactions.length > 0) {
        const cartIds = [
          ...new Set(transactions.map((transaction) => transaction.cart_id)),
        ];
        cartDetails = await CartDetail.getByCartIdsShift(cartIds);
      }

      // Separate cartDetails into cartDetailsSuccess and cartDetailsPending
      const cartDetailsSuccess = cartDetails
        .filter((cart) => {
          const associatedTransaction = transactions.find(
            (transaction) =>
              transaction.cart_id === cart.cart_id &&
              transaction.invoice_number !== null
          );
          return !!associatedTransaction;
        })
        .filter((cart) => cart.total_price > 0 && (cart.is_canceled == null || cart.is_canceled == 0));

      const cartDetailsPending = cartDetails.filter((cart) => {
        const associatedTransaction = transactions.find(
          (transaction) =>
            transaction.cart_id === cart.cart_id &&
            transaction.invoice_number === null
        );

        const isCanceled = cart.is_canceled == null || cart.is_canceled == 0;

        return !!associatedTransaction && isCanceled;
      });

      const cartDetailsCanceled = cartDetails.filter(
        (cart) => cart.is_canceled == 1
      );

      const payment_details = [];
      let totalCashSales = 0
      const payment_types = await PaymentType.getAll(outlet_id);
      const refundDetails = await RefundDetail.getShiftReport(outlet_id, startDateString, endDateString);
      const refundAllTransactions = await Refund.getShiftReport(outlet_id, startDateString, endDateString);

      // Iterate through each payment type
      for (const paymentType of payment_types) {
        // Get transactions related to the current payment type
        const transactionsByPaymentType = transactions.filter(
          (transaction) => transaction.payment_type_id === paymentType.id
        );

        // Calculate total amount for the current payment type
        const totalPayment = transactionsByPaymentType.reduce(
          (total, transaction) => total + transaction.total,
          0
        );
        
        if (paymentType.id != 1) {
          // Create payment type detail object
          const paymentTypeDetail = {
            payment_type: paymentType.name,
            total_payment: totalPayment,
            is_success: 1,
            is_refund: 0,
          };

          const refundTransactionByPaymentType = refundAllTransactions
          .filter((refund) => refund.payment_type_id == paymentType.id);

          const refundTransactionIds = refundTransactionByPaymentType
          .map((refund) => refund.id);

          const totalRefundTransaction = refundTransactionByPaymentType
          .reduce((total, refund) => total + refund.total_refund, 0);
          
          const totalRefundPerItemByPaymentType = refundDetails
            .filter((refund) => refund.payment_type_id == paymentType.id && !refundTransactionIds.includes(refund.refund_id))
            .reduce((total, refund) => total + refund.total_refund_price, 0);

          // Calculate total refund amount for the current payment type
          const totalRefund = totalRefundTransaction + totalRefundPerItemByPaymentType;

          // If there are refunds, add a new payment type detail for refunds
          if (totalRefund > 0) {
            const refundPaymentTypeDetail = {
              payment_type: `${paymentType.name} Refund`,
              total_payment: totalRefund,
              is_success: 0,
              is_refund: 1,
            };
            payment_details.push({
              payment_category: paymentType.payment_category_name,
              payment_type_detail: [paymentTypeDetail, refundPaymentTypeDetail],
              payment_category_id: paymentType.payment_category_id,
              total_amount: totalPayment - totalRefund,
            });
          } else {
            if (paymentTypeDetail.total_payment > 0) {
              // Find the payment category name
              const paymentCategoryName = payment_types.find(
                (pt) => pt.payment_category_id === paymentType.payment_category_id
              ).payment_category_name;

              // Check if a payment category with the same name already exists
              const existingPaymentCategory = payment_details.find(
                (pd) => pd.payment_category === paymentCategoryName
              );

              // If exists, push the payment type detail to existing payment category
              if (existingPaymentCategory) {
                existingPaymentCategory.payment_type_detail.push(
                  paymentTypeDetail
                );
              } else {
                // If not exists, create a new payment category
                const newPaymentCategory = {
                  payment_category: paymentCategoryName,
                  payment_type_detail: [paymentTypeDetail],
                  payment_category_id: paymentType.payment_category_id,
                };
                payment_details.push(newPaymentCategory);
              }
            }
          }
        } else {
          totalCashSales += totalPayment;
        }
      }

      // for Cash payment type
      const totalRefundedCashFromOtherPaymentWithRefundAll = refundAllTransactions
        .filter((refund) => refund.payment_type_id == 1)
        .reduce((total, refund) => total + refund.total_refund, 0 );

      const totalRefundedCashFromOtherPaymentWithNotRefundAll = refundDetails
        .filter((refund) => refund.payment_type_id == 1 && refund.is_refund_type_all == 0)
        .reduce((total, refund) => total + refund.total_refund_price, 0 );

      const totalCashRefunded = totalRefundedCashFromOtherPaymentWithRefundAll + totalRefundedCashFromOtherPaymentWithNotRefundAll;
      
      const paymentDetailsCash = {
        payment_category: "Cash Payment",
        payment_type_detail: [
          {
            payment_type: "Cash Sales",
            total_payment: totalCashSales,

            is_success: 1,
            is_refund: 0,
            is_pending: 0,
          },
          {
            payment_type: "Cash from Invoice",
            total_payment: cartDetailsPending.reduce(
              (total, cart) => total + cart.total_price,
              0
            ),
            is_success: 0,
            is_refund: 0,
            is_pending: 1,
          },
          {
            payment_type: "Cash Refund",
            // total_payment: totalCashRefund,
            total_payment: totalCashRefunded,
            is_success: 0,
            is_refund: 1,
            is_pending: 0,
          },
          {
            payment_type: "Cash Canceled",
            total_payment: cartDetailsCanceled.reduce(
              (total, cart) => total + cart.total_price,
              0
            ),
            is_success: 0,
            is_refund: 0,
            is_pending: 0,
          },
        ],
        payment_category_id: 1,
      };
      payment_details.unshift(paymentDetailsCash);

      // Calculate and add total_amount to each object in payment_details
      for (const paymentCategory of payment_details) {
        const totalSuccessPayment = paymentCategory.payment_type_detail
          .filter((pt) => pt.is_success === 1)
          .reduce((total, paymentType) => total + paymentType.total_payment, 0);

        const totalRefundPayment = paymentCategory.payment_type_detail
          .filter((pt) => pt.is_refund === 1)
          .reduce((total, paymentType) => total + paymentType.total_payment, 0);

        paymentCategory.total_amount = totalSuccessPayment - totalRefundPayment;
      }

      // Calculate subtotal_transaction
      const total_transaction = payment_details.reduce(
        (total, paymentCategory) => total + paymentCategory.total_amount,
        0
      );

      const mergeAndSumCartDetails = (cartDetails, is_refund) => {
        const mergedCartDetails = [];

        cartDetails.forEach((cart) => {
          const existingCartItem = mergedCartDetails.find(
            (mergedCart) =>
              mergedCart.menu_id == cart.menu_id &&
              mergedCart.menu_detail_id == cart.menu_detail_id
          );

          if (existingCartItem) {
            if (is_refund) {
              existingCartItem.qty_refund_item += cart.qty_refund_item;
              existingCartItem.total_refund_price += cart.total_refund_price;
            } else {
              existingCartItem.qty += cart.qty;
              existingCartItem.total_price += cart.total_price;
            }
          } else {
            const newCartItem = {
              menu_id: cart.menu_id,
              menu_detail_id: cart.menu_detail_id,
              menu_name: cart.menu_name,
              menu_type: cart.menu_type,
              varian: cart.varian,
            };
            if (is_refund) {
              newCartItem.qty_refund_item = cart.qty_refund_item;
              newCartItem.total_refund_price = cart.total_refund_price;
            } else {
              newCartItem.qty = cart.qty;
              newCartItem.total_price = cart.total_price;
            }
            mergedCartDetails.push(newCartItem);
          }
        });

        return mergedCartDetails;
      };

      const cartDetailsSuccessFiltered = mergeAndSumCartDetails(
        cartDetailsSuccess,
        false
      );
      const cartDetailsPendingFiltered = mergeAndSumCartDetails(
        cartDetailsPending,
        false
      );
      const cartDetailsCanceledFiltered = mergeAndSumCartDetails(
        cartDetailsCanceled,
        false
      );
      const refundDetailsFiltered = mergeAndSumCartDetails(refundDetails, true);

      // Function to calculate sold_items, total_amount, discount_amount_transactions, and discount_amount_per_items
      function calculateSummary(
        cartDetailsSuccess,
        cartDetailsPending,
        cartDetailsCanceled,
        refundDetails,
        transactions,
        refundAllTransactions
      ) {
        // sum qty
        const totalSuccessQty = cartDetailsSuccess.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalPendingQty = cartDetailsPending.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalCanceledQty = cartDetailsCanceled.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalRefundQty = refundDetails.reduce(
          (total, refund) => total + refund.qty_refund_item,
          0
        );

        const subtotalCartRefundAmount = refundDetails.reduce(
          (total, cart) => total + (cart.price * cart.qty_refund_item),
          0
        );

        // sum total
        const totalCartSuccessAmount = cartDetailsSuccess.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartPendingAmount = cartDetailsPending.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartCanceledAmount = cartDetailsCanceled.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartRefundAmount = refundDetails.reduce(
          (total, refund) => total + refund.total_refund_price,
          0
        );

        // sum total discount cart
        const transactionsIds = transactions
        .filter((transaction) => {
          return transaction.discount_id > 0 && transaction.invoice_number !== null;
        })
        .map((transaction) => transaction.transaction_id);

        const discountedRefundTransaction = refundAllTransactions
        .filter((refund) => {
          refund.discount_id > 0 && !transactionsIds.includes(refund.transaction_id)
        })
        .reduce((total, refund) => total + (refund.subtotal_cart - refund.total_refund), 0);

        const discountedTransactions = transactions
        .filter((transaction) => transaction.discount_id > 0 && transaction.invoice_number !== null)
        .reduce(
          (total, transaction) => total + (transaction.subtotal - transaction.total), 0);
        
        const discount_amount_transactions = discountedTransactions + discountedRefundTransaction;

        // sum total discount per item
        const totalDiscountedAmountPerSuccessItems = cartDetailsSuccess
        .filter((item) => item.discount_id > 0 || item.discount_id != null)
        .reduce((total, item) => total + (item.subtotal_price - item.total_price), 0);
        
        const discount_amount_per_items = totalDiscountedAmountPerSuccessItems + (subtotalCartRefundAmount - totalCartRefundAmount);
        
        return {
          totalSuccessQty,
          totalPendingQty,
          totalCanceledQty,
          totalRefundQty,
          totalCartSuccessAmount,
          totalCartPendingAmount,
          totalCartCanceledAmount,
          totalCartRefundAmount,
          discount_amount_transactions,
          discount_amount_per_items,
        };
      }

      const {
        totalSuccessQty,
        totalPendingQty,
        totalCanceledQty,
        totalRefundQty,
        totalCartSuccessAmount,
        totalCartPendingAmount,
        totalCartCanceledAmount,
        totalCartRefundAmount,
        discount_amount_transactions,
        discount_amount_per_items,
      } = calculateSummary(
        cartDetailsSuccess,
        cartDetailsPending,
        cartDetailsCanceled,
        refundDetails,
        transactions,
        refundAllTransactions
      );

      const discount_total_amount = discount_amount_per_items + discount_amount_transactions;
      const ending_cash_expected = totalCashSales - expenditure.totalExpense;
      const cash_difference = actual_ending_cash - ending_cash_expected;

      const result = {
        outlet_name: outlet.name,
        outlet_address: outlet.address,
        outlet_phone_number: outlet.phone_number,
        casher_name: casher_name,
        shift_number: shiftNumber,
        start_date: startDateString,
        end_date: endDateString,

        expenditures: expenditure.lists,
        expenditures_total: expenditure.totalExpense,
        ending_cash_expected: ending_cash_expected,
        ending_cash_actual: actual_ending_cash ? actual_ending_cash : 0,
        cash_difference,

        discount_amount_transactions,
        discount_amount_per_items,
        discount_total_amount,

        cart_details_success: cartDetailsSuccessFiltered,
        totalSuccessQty,
        totalCartSuccessAmount,

        cart_details_pending: cartDetailsPendingFiltered,
        totalPendingQty,
        totalCartPendingAmount,

        cart_details_canceled: cartDetailsCanceledFiltered,
        totalCanceledQty,
        totalCartCanceledAmount,

        refund_details: refundDetailsFiltered,
        totalRefundQty,
        totalCartRefundAmount,

        payment_details,
        total_transaction: total_transaction,
      };

      return res.status(200).json({
        code: 200,
        message: "Struk shift berhasil ditampilkan!",
        data: result,
      });
    }
  } catch (error) {
    logger.error(`Error in outlet ${outlet_id}, getLastShiftStruct: ${error.stack}`);
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

exports.getShift = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const { outlet_id } = req.query;
  try {
    const shiftReports = await ShiftReport.getLastStartDateShift(outlet_id);
    if (shiftReports.length == 0) {
      return res.status(200).json({
        message: "Laporan Kosong!",
        data: null,
      });
    } else {
      const casher_name = shiftReports[1].casher_name;
      const shiftNumber = shiftReports[1].shift_number;
      const startDate = moment(shiftReports[0].start_date).tz("Asia/Jakarta");
      const endDate = indoDateTime;
      const startDateString = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
      const endDateString = moment(endDate).format("YYYY-MM-DD HH:mm:ss");

      const outlet = await Outlet.getByOutletId(outlet_id);
      const expenditure = await Expenditure.getExpenseReport(
        outlet_id,
        startDateString,
        endDateString
      );
      const transactions = await Transaction.getShiftReport(
        outlet_id,
        startDateString,
        endDateString
      );

      let cartDetails = [];
      if (transactions.length > 0) {
        const cartIds = [
          ...new Set(transactions.map((transaction) => transaction.cart_id)),
        ];
        cartDetails = await CartDetail.getByCartIdsShift(cartIds);
      }

      // Separate cartDetails into cartDetailsSuccess and cartDetailsPending
      const cartDetailsSuccess = cartDetails
        .filter((cart) => {
          const associatedTransaction = transactions.find(
            (transaction) =>
              transaction.cart_id === cart.cart_id &&
              transaction.invoice_number !== null
          );
          return !!associatedTransaction;
        })
        .filter((cart) => cart.total_price > 0 && (cart.is_canceled == null || cart.is_canceled == 0));

      const cartDetailsPending = cartDetails.filter((cart) => {
        const associatedTransaction = transactions.find(
          (transaction) =>
            transaction.cart_id === cart.cart_id &&
            transaction.invoice_number === null
        );

        const isCanceled = cart.is_canceled == null || cart.is_canceled == 0;

        return !!associatedTransaction && isCanceled;
      });

      // Extract cart details for canceled transactions
      const cartDetailsCanceled = cartDetails.filter(
        (cart) => cart.is_canceled == 1
      );

      const payment_details = [];
      let totalCashSales = 0
      const payment_types = await PaymentType.getAll(outlet_id);
      const refundDetails = await RefundDetail.getShiftReport(outlet_id, startDateString, endDateString);
      const refundAllTransactions = await Refund.getShiftReport(outlet_id, startDateString, endDateString);

      // Iterate through each payment type
      for (const paymentType of payment_types) {
        // Get transactions related to the current payment type
        const transactionsByPaymentType = transactions.filter(
          (transaction) => transaction.payment_type_id === paymentType.id
        );

        // Calculate total amount for the current payment type
        const totalPayment = transactionsByPaymentType.reduce(
          (total, transaction) => total + transaction.total,
          0
        );

        if (paymentType.id != 1) {
          // Create payment type detail object
          const paymentTypeDetail = {
            payment_type: paymentType.name,
            total_payment: totalPayment,
            is_success: 1,
            is_refund: 0,
          };

          const refundTransactionByPaymentType = refundAllTransactions
          .filter((refund) => refund.payment_type_id == paymentType.id);

          const refundTransactionIds = refundTransactionByPaymentType
          .map((refund) => refund.id);

          const totalRefundTransaction = refundTransactionByPaymentType
          .reduce((total, refund) => total + refund.total_refund, 0);
          
          const totalRefundPerItemByPaymentType = refundDetails
            .filter((refund) => refund.payment_type_id == paymentType.id && !refundTransactionIds.includes(refund.refund_id))
            .reduce((total, refund) => total + refund.total_refund_price, 0);

          // Calculate total refund amount for the current payment type
          const totalRefund = totalRefundTransaction + totalRefundPerItemByPaymentType;

          // If there are refunds, add a new payment type detail for refunds
          if (totalRefund > 0) {
            const refundPaymentTypeDetail = {
              payment_type: `${paymentType.name} Refund`,
              total_payment: totalRefund,
              is_success: 0,
              is_refund: 1,
            };
            payment_details.push({
              payment_category: paymentType.payment_category_name,
              payment_type_detail: [paymentTypeDetail, refundPaymentTypeDetail],
              payment_category_id: paymentType.payment_category_id,
              total_amount: totalPayment - totalRefund,
            });
          } else {
            if (paymentTypeDetail.total_payment > 0) {
              // Find the payment category name
              const paymentCategoryName = payment_types.find(
                (pt) => pt.payment_category_id === paymentType.payment_category_id
              ).payment_category_name;

              // Check if a payment category with the same name already exists
              const existingPaymentCategory = payment_details.find(
                (pd) => pd.payment_category === paymentCategoryName
              );

              // If exists, push the payment type detail to existing payment category
              if (existingPaymentCategory) {
                existingPaymentCategory.payment_type_detail.push(
                  paymentTypeDetail
                );
              } else {
                // If not exists, create a new payment category
                const newPaymentCategory = {
                  payment_category: paymentCategoryName,
                  payment_type_detail: [paymentTypeDetail],
                  payment_category_id: paymentType.payment_category_id,
                };
                payment_details.push(newPaymentCategory);
              }
            }
          }
        } else {
          totalCashSales += totalPayment;
        }
      }

      // for Cash payment type
      const totalRefundedCashFromOtherPaymentWithRefundAll = refundAllTransactions
        .filter((refund) => refund.payment_type_id == 1)
        .reduce((total, refund) => total + refund.total_refund, 0 );

      const totalRefundedCashFromOtherPaymentWithNotRefundAll = refundDetails
        .filter((refund) => refund.payment_type_id == 1 && refund.is_refund_type_all == 0)
        .reduce((total, refund) => total + refund.total_refund_price, 0 );

      const totalCashRefunded = totalRefundedCashFromOtherPaymentWithRefundAll + totalRefundedCashFromOtherPaymentWithNotRefundAll;
      
      const paymentDetailsCash = {
        payment_category: "Cash Payment",
        payment_type_detail: [
          {
            payment_type: "Cash Sales",
            total_payment: totalCashSales,

            is_success: 1,
            is_refund: 0,
            is_pending: 0,
          },
          {
            payment_type: "Cash from Invoice",
            total_payment: cartDetailsPending.reduce(
              (total, cart) => total + cart.total_price,
              0
            ),
            is_success: 0,
            is_refund: 0,
            is_pending: 1,
          },
          {
            payment_type: "Cash Refund",
            // total_payment: totalCashRefund,
            total_payment: totalCashRefunded,
            is_success: 0,
            is_refund: 1,
            is_pending: 0,
          },
          {
            payment_type: "Cash Canceled",
            total_payment: cartDetailsCanceled.reduce(
              (total, cart) => total + cart.total_price,
              0
            ),
            is_success: 0,
            is_refund: 0,
            is_pending: 0,
          },
        ],
        payment_category_id: 1,
      };
      payment_details.unshift(paymentDetailsCash);

      // Calculate and add total_amount to each object in payment_details
      for (const paymentCategory of payment_details) {
        const totalSuccessPayment = paymentCategory.payment_type_detail
          .filter((pt) => pt.is_success === 1)
          .reduce((total, paymentType) => total + paymentType.total_payment, 0);

        const totalRefundPayment = paymentCategory.payment_type_detail
          .filter((pt) => pt.is_refund === 1)
          .reduce((total, paymentType) => total + paymentType.total_payment, 0);

        paymentCategory.total_amount = totalSuccessPayment - totalRefundPayment;
      }

      // Calculate subtotal_transaction
      const total_transaction = payment_details.reduce(
        (total, paymentCategory) => total + paymentCategory.total_amount,
        0
      );

      const mergeAndSumCartDetails = (cartDetails, is_refund) => {
        const mergedCartDetails = [];

        cartDetails.forEach((cart) => {
          const existingCartItem = mergedCartDetails.find(
            (mergedCart) =>
              mergedCart.menu_id == cart.menu_id &&
              mergedCart.menu_detail_id == cart.menu_detail_id
          );

          if (existingCartItem) {
            if (is_refund) {
              existingCartItem.qty_refund_item += cart.qty_refund_item;
              existingCartItem.total_refund_price += cart.total_refund_price;
            } else {
              existingCartItem.qty += cart.qty;
              existingCartItem.total_price += cart.total_price;
            }
          } else {
            const newCartItem = {
              menu_id: cart.menu_id,
              menu_detail_id: cart.menu_detail_id,
              menu_name: cart.menu_name,
              menu_type: cart.menu_type,
              varian: cart.varian,
            };
            if (is_refund) {
              newCartItem.qty_refund_item = cart.qty_refund_item;
              newCartItem.total_refund_price = cart.total_refund_price;
            } else {
              newCartItem.qty = cart.qty;
              newCartItem.total_price = cart.total_price;
            }
            mergedCartDetails.push(newCartItem);
          }
        });

        return mergedCartDetails;
      };

      const cartDetailsSuccessFiltered = mergeAndSumCartDetails(
        cartDetailsSuccess,
        false
      );
      const cartDetailsPendingFiltered = mergeAndSumCartDetails(
        cartDetailsPending,
        false
      );
      const cartDetailsCanceledFiltered = mergeAndSumCartDetails(
        cartDetailsCanceled,
        false
      );
      const refundDetailsFiltered = mergeAndSumCartDetails(refundDetails, true);

      // Function to calculate sold_items, total_amount, discount_amount_transactions, and discount_amount_per_items
      function calculateSummary(
        cartDetailsSuccess,
        cartDetailsPending,
        cartDetailsCanceled,
        refundDetails,
        transactions,
        refundAllTransactions
      ) {
        // sum qty
        const totalSuccessQty = cartDetailsSuccess.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalPendingQty = cartDetailsPending.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalCanceledQty = cartDetailsCanceled.reduce(
          (total, cart) => total + cart.qty,
          0
        );
        const totalRefundQty = refundDetails.reduce(
          (total, refund) => total + refund.qty_refund_item,
          0
        );

        const subtotalCartRefundAmount = refundDetails.reduce(
          (total, cart) => total + (cart.price * cart.qty_refund_item),
          0
        );

        // sum total
        const totalCartSuccessAmount = cartDetailsSuccess.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartPendingAmount = cartDetailsPending.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartCanceledAmount = cartDetailsCanceled.reduce(
          (total, cart) => total + cart.total_price,
          0
        );
        const totalCartRefundAmount = refundDetails.reduce(
          (total, refund) => total + refund.total_refund_price,
          0
        );

        // sum total discount cart
        const transactionsIds = transactions
        .filter((transaction) => {
          return transaction.discount_id > 0 && transaction.invoice_number !== null;
        })
        .map((transaction) => transaction.transaction_id);

        const discountedRefundTransaction = refundAllTransactions
        .filter((refund) => {
          refund.discount_id > 0 && !transactionsIds.includes(refund.transaction_id)
        })
        .reduce((total, refund) => total + (refund.subtotal_cart - refund.total_refund), 0);

        const discountedTransactions = transactions
        .filter((transaction) => transaction.discount_id > 0 && transaction.invoice_number !== null)
        .reduce(
          (total, transaction) => total + (transaction.subtotal - transaction.total), 0);
        
        const discount_amount_transactions = discountedTransactions + discountedRefundTransaction;

        // sum total discount per item
        const totalDiscountedAmountPerSuccessItems = cartDetailsSuccess
        .filter((item) => item.discount_id > 0 || item.discount_id != null)
        .reduce((total, item) => total + (item.subtotal_price - item.total_price), 0);
        
        const discount_amount_per_items = totalDiscountedAmountPerSuccessItems + (subtotalCartRefundAmount - totalCartRefundAmount);
        
        return {
          totalSuccessQty,
          totalPendingQty,
          totalCanceledQty,
          totalRefundQty,
          totalCartSuccessAmount,
          totalCartPendingAmount,
          totalCartCanceledAmount,
          totalCartRefundAmount,
          discount_amount_transactions,
          discount_amount_per_items,
        };
      }

      const {
        totalSuccessQty,
        totalPendingQty,
        totalCanceledQty,
        totalRefundQty,
        totalCartSuccessAmount,
        totalCartPendingAmount,
        totalCartCanceledAmount,
        totalCartRefundAmount,
        discount_amount_transactions,
        discount_amount_per_items,
      } = calculateSummary(
        cartDetailsSuccess,
        cartDetailsPending,
        cartDetailsCanceled,
        refundDetails,
        transactions,
        refundAllTransactions
      );

      const discount_total_amount = discount_amount_per_items + discount_amount_transactions;
      const ending_cash_expected = totalCashSales - expenditure.totalExpense;

      const result = {
        outlet_name: outlet.name,
        outlet_address: outlet.address,
        outlet_phone_number: outlet.phone_number,
        casher_name: casher_name,
        shift_number: shiftNumber,
        start_date: startDateString,
        end_date: endDateString,

        expenditures: expenditure.lists,
        expenditures_total: expenditure.totalExpense,
        ending_cash_expected: ending_cash_expected,

        discount_amount_transactions,
        discount_amount_per_items,
        discount_total_amount,
        
        cart_details_success: cartDetailsSuccessFiltered,
        totalSuccessQty,
        totalCartSuccessAmount,

        cart_details_pending: cartDetailsPendingFiltered,
        totalPendingQty,
        totalCartPendingAmount,

        cart_details_canceled: cartDetailsCanceledFiltered,
        totalCanceledQty,
        totalCartCanceledAmount,

        refund_details: refundDetailsFiltered,
        totalRefundQty,
        totalCartRefundAmount,

        payment_details,
        total_transaction: total_transaction,
      };

      return res.status(200).json({
        code: 200,
        message: "Riwayat shift berhasil ditampilkan!",
        data: result,
      });
    }
  } catch (error) {
    logger.error(`Error in outlet ${outlet_id}, getShift: ${error.stack}`);
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};
