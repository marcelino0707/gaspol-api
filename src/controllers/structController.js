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
  const { start_time, end_time, outlet_id, actual_ending_cash } = req.body;
  try {
    const outlet = await Outlet.getByOutletId(outlet_id);

    const startDateString =
      moment(thisTimeNow).format("YYYY-MM-DD") + " " + start_time;
    const endDateString =
      moment(thisTimeNow).format("YYYY-MM-DD") + " " + end_time;

    const expenditure = await Expenditure.getExpenseReport(
      outlet_id,
      startDateString,
      endDateString
    );
    const payment_types = await PaymentType.getAll(outlet_id);
    const transactions = await Transaction.getShiftReport(
      outlet_id,
      startDateString,
      endDateString
    );
    let cartDetails = [];
    let refundDetails = [];
    if (transactions.length > 0) {
      const cartIds = [
        ...new Set(transactions.map((transaction) => transaction.cart_id)),
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
    const cartDetailsSuccess = cartDetails.filter((cart) => {
      const associatedTransaction = transactions.find(
        (transaction) =>
          transaction.cart_id === cart.cart_id &&
          transaction.invoice_number !== null
      );
      return !!associatedTransaction;
    });

    const cartDetailsPending = cartDetails.filter((cart) => {
      const associatedTransaction = transactions.find(
        (transaction) =>
          transaction.cart_id === cart.cart_id &&
          transaction.invoice_number === null
      );
      return !!associatedTransaction;
    });

    // Function to calculate sold_items, total_amount, discount_amount_transactions, and discount_amount_per_items
    function calculateSummary(cartDetails, refundDetails, transactions) {
      const totalCartQty = cartDetails.reduce(
        (total, cart) => total + cart.qty,
        0
      );
      const totalRefundQty = refundDetails.reduce(
        (total, refund) => total + refund.qty_refund_item,
        0
      );

      const totalCartAmount = cartDetails.reduce(
        (total, cart) => total + cart.total_price,
        0
      );
      const totalRefundAmount = refundDetails.reduce(
        (total, refund) => total + refund.total_refund_price,
        0
      );

      const items_sold = totalCartQty + totalRefundQty;
      const items_total_amount = totalCartAmount + totalRefundAmount;

      const discount_amount_transactions = transactions.reduce(
        (total, transaction) => total + transaction.total_discount,
        0
      );

      const totalDiscountedPrice =
        cartDetails.reduce((total, cart) => total + cart.discounted_price, 0) +
        refundDetails.reduce(
          (total, refund) => total + refund.discounted_price,
          0
        );

      const discount_amount_per_items = totalDiscountedPrice;

      return {
        items_sold,
        items_total_amount,
        discount_amount_transactions,
        discount_amount_per_items,
      };
    }

    const {
      items_sold,
      items_total_amount,
      discount_amount_transactions,
      discount_amount_per_items,
    } = calculateSummary(cartDetails, refundDetails, transactions);

    const payment_details = [];
    const totalCashSales = cartDetailsSuccess.reduce(
      (total, cart) => total + cart.total_price,
      0
    );
    const paymentDetailsCash = {
      payment_category: "Cash Payment",
      payment_type_detail: [
        {
          payment_type: "Cash Sales",
          total_payment: totalCashSales,
        },
        {
          payment_type: "Cash from Invoice",
          total_payment: cartDetailsPending.reduce(
            (total, cart) => total + cart.total_price,
            0
          ),
        },
        {
          payment_type: "Cash Refund",
          total_payment: refundDetails.reduce(
            (total, refund) => total + refund.total_refund_price,
            0
          ),
        },
      ],
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
        };

        if (paymentTypeDetail.total_payment > 0) {
          // Find the payment category name
          const paymentCategoryName = payment_types.find(
            (pt) => pt.id === paymentType.payment_category_id
          ).payment_category_name;

          // Check if a payment category with the same name already exists
          const existingPaymentCategory = payment_details.find(
            (pd) => pd.payment_category === paymentCategoryName
          );

          // If exists, push the payment type detail to existing payment category
          if (existingPaymentCategory) {
            existingPaymentCategory.payment_type_detail.push(paymentTypeDetail);
          } else {
            // If not exists, create a new payment category
            const newPaymentCategory = {
              payment_category: paymentCategoryName,
              payment_type_detail: [paymentTypeDetail],
            };
            payment_details.push(newPaymentCategory);
          }
        }
      }
    }

    // Calculate and add total_amount to each object in payment_details
    for (const paymentCategory of payment_details) {
      paymentCategory.total_amount = paymentCategory.payment_type_detail.reduce(
        (total, paymentType) => total + paymentType.total_payment,
        0
      );
    }

    // Calculate subtotal_transaction
    const subtotal_transaction = payment_details.reduce(
      (total, paymentCategory) => total + paymentCategory.total_amount,
      0
    );

    const discount_total_amount =
      discount_amount_per_items + discount_amount_transactions;
    const ending_cash_expected = totalCashSales - expenditure.totalExpense;

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      outlet_phone_number: outlet.phone_number,
      start_date: startDateString,
      end_date: endDateString,
      expenditures: expenditure.lists,
      expenditures_total: expenditure.totalExpense,
      ending_cash_expected : ending_cash_expected,
      ending_cash_actual: actual_ending_cash,
      cash_difference: ending_cash_expected - actual_ending_cash,
      items_sold,
      items_total_amount,
      discount_amount_transactions,
      discount_amount_per_items,
      discount_total_amount: discount_total_amount,
      cart_details_success: cartDetailsSuccess,
      cart_details_pending: cartDetailsPending,
      refund_details: refundDetails,
      payment_details,
      total_transaction: subtotal_transaction - discount_total_amount,
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
