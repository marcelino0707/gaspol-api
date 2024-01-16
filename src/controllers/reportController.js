const Transaction = require("../models/transaction");
const RefundDetail = require("../models/refund_detail");
const CartDetail = require("../models/cart_detail");
const moment = require("moment-timezone");

exports.getReport = async (req, res) => {
  const thisTimeNow = moment();
  const { outlet_id, start_date, end_date, is_success, is_pending } = req.query;
  try {
    let startDate,
      endDate,
      isSuccess = is_success,
      isPending = is_pending;
    if (start_date && end_date) {
      startDate = start_date;
      endDate = end_date;
    } else {
      const dateNow = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD");
      startDate = dateNow;
      endDate = dateNow;
    }

    if (is_success == "true" && is_pending == "true") {
      isSuccess = "false";
      isPending = "false";
    }

    const transactions = await Transaction.getAllReport(
      outlet_id,
      startDate,
      endDate,
      isSuccess,
      isPending
    );
    return res.status(200).json({
      code: 200,
      message: "Laporan berhasil ditampilkan!",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the report",
    });
  }
};

exports.getPaymentReport = async (req, res) => {
  const thisTimeNow = moment();
  const { outlet_id, start_date, end_date } = req.query;
  try {
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = start_date;
      endDate = end_date;
    } else {
      const dateNow = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD");
      startDate = dateNow;
      endDate = dateNow;
    }
    const transactions = await Transaction.getByAllPaymentReport(
      outlet_id,
      startDate,
      endDate
    );
    if (transactions.length > 0) {
      const cartIds = [
        ...new Set(transactions.map((transaction) => transaction.cart_id)),
      ];
      const cartDetails = await CartDetail.getByCartIds(cartIds);
      let result = {
        transactions: [...transactions],
        cart_details: [...cartDetails],
      };

      const transactionsWithRefund = transactions.filter(
        (transaction) => transaction.refund_id !== null
      );
      let refundIdS = [];
      if (transactionsWithRefund.length > 0) {
        refundIdS = transactionsWithRefund.map(
          (transaction) => transaction.refund_id
        );
        const refunds = await RefundDetail.getByRefundIds(refundIdS);
        result.refund = [refunds];
      }

      const totalUangCashSeharusnya = transactions
        .filter((transaction) => transaction.payment_type === "Tunai")
        .reduce((total, transaction) => total + transaction.total, 0);

      const totalSeluruhPengeluaran = transactions.reduce(
        (total, transaction) => total + transaction.total_refund,
        0
      );

      const totalUangCashPengeluaran = transactions
        .filter((transaction) => transaction.payment_type === "Tunai")
        .reduce((total, transaction) => total + transaction.total_refund, 0);

      const paymentMethods = {};
      transactions.forEach((transaction) => {
        const { payment_type, total } = transaction;
        if (payment_type !== "Tunai") {
          if (!paymentMethods[payment_type]) {
            paymentMethods[payment_type] = total;
          } else {
            paymentMethods[payment_type] += total;
          }
        }
      });

      const totalOmset = Object.values(paymentMethods).reduce(
        (sum, value) => sum + value,
        0
      );

      result.payment_reports = {
        uang_cash_rill: totalUangCashSeharusnya - totalUangCashPengeluaran,
        pengeluaran_cash: totalUangCashPengeluaran,
        total_uang_cash_seharusnya:
          totalUangCashSeharusnya,
        ...paymentMethods,
        total_pengeluaran: totalSeluruhPengeluaran,
        total_omset: totalOmset + totalUangCashSeharusnya,
      };

      return res.status(200).json({
        code: 200,
        message: "Laporan berhasil ditampilkan!",
        data: result,
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "Laporan Kosong!",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "Some error occurred while get the payment report",
    });
  }
};
