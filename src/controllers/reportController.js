const Transaction = require("../models/transaction");
const RefundDetail = require("../models/refund_detail");
const CartDetail = require("../models/cart_detail");
const thisTimeNow = new Date();

exports.getReport = async (req, res) => {
  const { outlet_id, start_date, end_date, is_success, is_pending } = req.query;
  try {
    let startDate, endDate, isSuccess = is_success, isPending = is_pending;
    if(start_date && end_date) {
        startDate = start_date
        endDate = end_date
    } else {
      let dateNow = thisTimeNow.toLocaleDateString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      });

      dateNow = dateNow.split('/').reverse().join('-');

      startDate = dateNow;
      endDate = dateNow;
    }

    if(is_success == "true" && is_pending == "true") {
      isSuccess = "false";
      isPending = "false";
    }

    const transactions = await Transaction.getAllReport(outlet_id, startDate, endDate, isSuccess, isPending);
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
  const { outlet_id, start_date, end_date } = req.query;
  try {
    let startDate, endDate;
    if(start_date && end_date) {
        startDate = start_date
        endDate = end_date
    } else {
      let dateNow = thisTimeNow.toLocaleDateString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      });

      dateNow = dateNow.split('/').reverse().join('-');

      startDate = dateNow;
      endDate = dateNow;
    }
    const transactions = await Transaction.getByAllPaymentReport(outlet_id, startDate, endDate);
    if (transactions.length > 0) {
      const cartIds = [...new Set(transactions.map(transaction => transaction.cart_id))];
      const cartDetails = await CartDetail.getByCartIds(cartIds);
      let result = {
          transactions : [...transactions],
          cart_details : [...cartDetails]
      }

      const transactionsWithRefund = transactions.filter(transaction => transaction.total_refund !== null && transaction.total_refund > 0);
      if (transactionsWithRefund.length > 0) {
        
      }

      return res.status(200).json({
        code: 200,
        message: "Laporan berhasil ditampilkan!",
        data: result,
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "Laporan Kosong!",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the payment report",
    });
  }
};
