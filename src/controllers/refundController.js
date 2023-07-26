const Refund = require("../models/refund");
const RefundDetail = require("../models/refund_detail");
const TransactionDetail = require("../models/transaction_detail");

exports.createRefund = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { is_refund_all, refund_reason, transaction_details } = req.body;

    if (!transaction_details) {
      const refund = {
        transaction_id: transactionId,
        is_refund_all: is_refund_all,
        refund_reason: refund_reason,
      };

      await Refund.create(refund);
    } else {
      const transaction_Details = await TransactionDetail.getAllByTransactionID(transactionId);
      const refund = await Refund.getById(transactionId);
      for (const transactionDetailData of transaction_details) {
        const refundDetailData = {
          refund_id: refund.id,
          transaction_detail_id: transaction_Details.id,
          total_refund_item: transactionDetailData.total_refund_item,
          refund_reason_item: transactionDetailData.refund_reason_item,
        };

        await RefundDetail.create(refundDetailData);
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
