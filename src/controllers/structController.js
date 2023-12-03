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
const moment = require("moment-timezone");

exports.getCustomerStruct = async (req, res) => {
  const { id } = req.params;
  // const { outlet_id } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(transaction.outlet_id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);
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
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);

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

  const { outlet_id, actual_ending_cash, casher_name } = req.body;
  try {
    const shiftReports = await ShiftReport.getLastCreated(outlet_id);
    function getStartDate() {
      const today = moment().tz("Asia/Jakarta");
      const startDate = today.set({
        hour: 6,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      return startDate.toDate();
    }

    let startDate = getStartDate();
    let shiftNumber = 1;

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
      const shiftStartDate = moment(shiftReports.start_date).tz("Asia/Jakarta");

      if (
        shiftStartDate.isAfter(moment().tz("Asia/Jakarta").startOf("day")) &&
        shiftStartDate.isBefore(
          moment()
            .tz("Asia/Jakarta")
            .set({ hour: 5, minute: 0, second: 0, millisecond: 0 })
        )
      ) {
        await ShiftReport.update(shiftReports.id, {
          shift_number: 1,
          start_date: getStartDate(),
          end_date: indoDateTime,
          casher_name: casher_name,
          actual_ending_cash: actual_ending_cash,
          updated_at: indoDateTime,
        });
      } else {
        await ShiftReport.update(shiftReports.id, {
          end_date: indoDateTime,
          casher_name: casher_name,
          actual_ending_cash: actual_ending_cash,
          updated_at: indoDateTime,
        });
        startDate = shiftReports.start_date;
        shiftNumber = shiftReports.shift_number;
      }
    }

    // generate start_date for next shift
    const nextShiftStartDate = moment(indoDateTime).add(1, "seconds").toDate();
    await ShiftReport.create({
      outlet_id: outlet_id,
      start_date: nextShiftStartDate,
      shift_number: shiftNumber + 1,
    });

    // const startDateString = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
    const startDateString = moment(getStartDate()).format("YYYY-MM-DD HH:mm:ss");

    const endDateString = moment(indoDateTime).add(1, 'days').format("YYYY-MM-DD HH:mm:ss");

    const outlet = await Outlet.getByOutletId(outlet_id);
    const expenditure = await Expenditure.getExpenseReport(
      outlet_id,
      startDateString,
      endDateString
    );
    const payment_types = await PaymentType.getAll(outlet_id);
    const transactionsNotFiltered = await Transaction.getShiftReport(
      outlet_id,
      startDateString,
      endDateString
    );

    let cartDetails = [];
    let refundDetails = [];
    const transactions = transactionsNotFiltered.filter(
      (transaction) => transaction.is_canceled === 0
    );
    const transactionsCanceled = transactionsNotFiltered.filter(
      (transaction) => transaction.is_canceled === 1
    );
    if (transactions.length > 0) {
      const cartIds = [
        ...new Set(
          transactionsNotFiltered.map((transaction) => transaction.cart_id)
        ),
      ];
      cartDetails = await CartDetail.getByCartIdsShift(cartIds);

      const transactionsWithRefund = transactions.filter(
        (transaction) => transaction.refund_id !== null
      );

      if (transactionsWithRefund.length > 0) {
        const refundIdS = transactionsWithRefund.map(
          (transaction) => transaction.refund_id
        );
        refundDetails = await RefundDetail.getByRefundIdsShift(refundIdS);
      }
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
      .filter((cart) => cart.total_price > 0);

    const cartDetailsPending = cartDetails.filter((cart) => {
      const associatedTransaction = transactions.find(
        (transaction) =>
          transaction.cart_id === cart.cart_id &&
          transaction.invoice_number === null
      );
      return !!associatedTransaction;
    });

    // Extract cart details for canceled transactions
    const cartDetailsCanceled = cartDetails.filter((cart) => {
      const associatedCanceledTransaction = transactionsCanceled.find(
        (transaction) => transaction.cart_id === cart.cart_id
      );
      return !!associatedCanceledTransaction;
    });

    const payment_details = [];
    const cartDetailsSuccessCash = cartDetails
      .filter((cart) => {
        const associatedTransaction = transactions.find(
          (transaction) =>
            transaction.cart_id == cart.cart_id &&
            transaction.invoice_number !== null &&
            transaction.payment_type_id == 1
        );
        return !!associatedTransaction;
      })
      .filter((cart) => cart.total_price > 0);

    const totalCashSales = cartDetailsSuccessCash.reduce(
      (total, cart) => total + cart.total_price,
      0
    );

    const cashRefundDetails = refundDetails.filter(
      (refund) => refund.payment_type_id == 1
    );

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
          total_payment: cashRefundDetails.reduce(
            (total, refund) => total + refund.total_refund_price,
            0
          ),
          is_success: 0,
          is_refund: 1,
          is_pending: 0,
        },
        {
          payment_type: "Cash Canceled",
          total_payment: transactionsCanceled.reduce(
            (total, transaction) => total + transaction.total,
            0
          ),
          is_success: 0,
          is_refund: 0,
          is_pending: 0,
        },
      ],
      payment_category_id: 1,
    };
    payment_details.push(paymentDetailsCash);

    // Iterate through each payment type
    for (const paymentType of payment_types) {
      if (paymentType.id != 1) {
        // Get transactions related to the current payment type
        const transactionsByPaymentType = transactions.filter(
          (transaction) => transaction.payment_type_id === paymentType.id
        );

        // Calculate total amount for the current payment type
        const totalPayment = transactionsByPaymentType.reduce(
          (total, transaction) => total + transaction.total,
          0
        );

        // Create payment type detail object
        const paymentTypeDetail = {
          payment_type: paymentType.name,
          total_payment: totalPayment,
          is_success: 1,
          is_refund: 0,
        };

        // Filter refund details for the current payment type
        const refundDetailsByPaymentType = refundDetails.filter(
          (refund) => refund.payment_type_id === paymentType.id
        );

        // Calculate total refund amount for the current payment type
        const totalRefund = refundDetailsByPaymentType.reduce(
          (total, refund) => total + refund.total_refund_price,
          0
        );

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
      }
    }

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

    // Function to calculate sold_items, total_amount, discount_amount_transactions, and discount_amount_per_items
    function calculateSummary(
      cartDetailsSuccess,
      cartDetailsPending,
      cartDetailsCanceled,
      refundDetails,
      transactions
    ) {
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

      const subtotalCartSuccessAmount = cartDetailsSuccess.reduce(
        (total, cart) => total + cart.price * cart.qty,
        0
      );

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

      const subtotalCartRefundAmount = refundDetails.reduce(
        (total, cart) => total + cart.price * cart.qty_refund_item,
        0
      );

      const totalCartRefundAmount = refundDetails.reduce(
        (total, refund) => total + refund.total_refund_price,
        0
      );

      const discount_amount_transactions = transactions.reduce(
        (total, transaction) => total + transaction.total_discount,
        0
      );

      const discountAmountCashTransactions = transactions
        .filter((transaction) => transaction.payment_type_id == 1)
        .reduce((total, transaction) => total + transaction.total_discount, 0);

      const discount_amount_per_items =
        subtotalCartSuccessAmount -
        totalCartSuccessAmount +
        (subtotalCartRefundAmount - totalCartRefundAmount);

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
        discountAmountCashTransactions,
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
      discountAmountCashTransactions,
    } = calculateSummary(
      cartDetailsSuccess,
      cartDetailsPending,
      cartDetailsCanceled,
      refundDetails,
      transactions
    );

    const discount_total_amount =
      discount_amount_per_items + discount_amount_transactions;
    const ending_cash_expected = (totalCashSales - discountAmountCashTransactions) - expenditure.totalExpense;
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
      cart_details_success: cartDetailsSuccess,
      totalSuccessQty,
      totalCartSuccessAmount,

      cart_details_pending: cartDetailsPending,
      totalPendingQty,
      totalCartPendingAmount,

      cart_details_canceled: cartDetailsCanceled,
      totalCanceledQty,
      totalCartCanceledAmount,

      refund_details: refundDetails,
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
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};
