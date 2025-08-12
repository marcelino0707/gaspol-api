const Transaction = require("../models/transaction");
const RefundDetail = require("../models/refund_detail");
const CartDetail = require("../models/cart_detail");
const ShiftReport = require("../models/shift_report");
const moment = require("moment-timezone");
const Expenditure = require("../models/expenditure");

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

    const listShift = await ShiftReport.getShiftNumber(outlet_id, startDate, endDate);
    const unShift = await ShiftReport.getUnShiftNumber(outlet_id, startDate);

    if (unShift.length > 0) {
      const shiftStartDate = moment(startDate).tz("Asia/Jakarta");
      const shiftEndDate = moment(endDate).tz("Asia/Jakarta");
      if (shiftStartDate.isSame(shiftEndDate, 'day')) {
        const unShiftEndDate = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        const unShiftTransaction = await Transaction.haveSuccessTransactions(outlet_id, unShift[0].start_date, unShiftEndDate);
        if (unShiftTransaction.length > 0) {
          listShift.unshift({ shift_number: "Unshift" });
        }
      }
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

    transactions.forEach((transaction) => {
      if (transaction.invoice_number != null) {
        transaction.status = "Paid";
      } else {
        transaction.status = "Pending";
      }

      if (transaction.is_refunded == 1) {
        transaction.status = "Refunded";
      } else if (transaction.is_canceled == 1) {
        transaction.status = "Canceled";
      }
    });

    const turnoversByDate = transactions.reduceRight((result, transaction) => {
      const { invoice_due_date, payment_type_id, payment_type, total } = transaction;
      // Skip transactions without invoice_due_date
      if (invoice_due_date !== null) {
        const totalTransactionAmount = total;

        // Extract the date part (yyyy-mm-dd) from invoice_due_date
        const datePart = invoice_due_date.split(' ')[0];

        // Check if datePart already exists in the result array
        const existingDateIndex = result.findIndex(item => item.invoice_due_date === datePart);

        if (existingDateIndex !== -1) {
          // If datePart exists, update the total amount and details
          result[existingDateIndex].total_turnover += totalTransactionAmount;

          // Check if payment type already exists in details array
          const existingPaymentTypeIndex = result[existingDateIndex].details.findIndex(item => item.payment_type_id === payment_type_id);
          if (existingPaymentTypeIndex !== -1) {
            // If payment type exists, update the total amount in details
            result[existingDateIndex].details[existingPaymentTypeIndex].total_amount += totalTransactionAmount;
          } else {
            // If payment type doesn't exist, add a new entry to details
            result[existingDateIndex].details.push({
              payment_type_id: payment_type_id,
              payment_type: payment_type,
              total_amount: totalTransactionAmount,
            });
          }
        } else {
          // If datePart doesn't exist, add a new entry to result
          result.push({
            invoice_due_date: datePart,
            total_turnover: totalTransactionAmount,
            details: [{
              payment_type_id: payment_type_id,
              payment_type: payment_type,
              total_amount: totalTransactionAmount,
            }],
          });
        }
      }

      return result;
    }, []);

    return res.status(200).json({
      code: 200,
      message: "Laporan berhasil ditampilkan!",
      data: transactions,
      start_date: startDate,
      end_date: endDate,
      list_shift: listShift,
      chart: turnoversByDate,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the report",
    });
  }
};

exports.getPaymentReport = async (req, res) => {
  const { outlet_id, start_date, end_date, is_shift } = req.query;
  try {
    // Ambil tanggal saja untuk filter awal
    const startDateOnly = moment(start_date).format("YYYY-MM-DD");
    const endDateOnly = moment(end_date).format("YYYY-MM-DD");

    let shifts = [], totalAmount = 0, totalDiscount = 0, casherNames = [],
      actualEndingCash = 0, cashDifference = 0, expectedEndingCash = 0;

    // Fetch shifts dengan rentang tanggal yang lebih luas
    if (is_shift && (is_shift > 0 || is_shift === "Unshift")) {
      shifts = await ShiftReport.getShiftByShiftNumber(
        outlet_id,
        moment(startDateOnly).subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss"),
        moment(endDateOnly).add(1, 'day').endOf('day').format("YYYY-MM-DD HH:mm:ss"),
        is_shift
      );
    } else {
      shifts = await ShiftReport.getShiftByShiftNumber(
        outlet_id,
        moment(startDateOnly).subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss"),
        moment(endDateOnly).add(1, 'day').endOf('day').format("YYYY-MM-DD HH:mm:ss")
      );
    }

    // Filter shifts yang sesuai dengan kriteria tanggal dan shift
    const filteredShifts = shifts.filter(shift => {
      const shiftStartMoment = moment(shift.start_date);
      const shiftEndMoment = shift.end_date ? moment(shift.end_date) : moment();

      // Cek apakah shift berada dalam rentang tanggal yang diminta
      return (
        (shiftStartMoment.isSameOrAfter(moment(startDateOnly).subtract(1, 'day')) &&
          shiftStartMoment.isSameOrBefore(moment(endDateOnly).add(1, 'day'))) ||
        (shiftEndMoment.isSameOrAfter(moment(startDateOnly).subtract(1, 'day')) &&
          shiftEndMoment.isSameOrBefore(moment(endDateOnly).add(1, 'day')))
      );
    });

    if (filteredShifts.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "Laporan Kosong!",
        data: null,
      });
    }

    // Tentukan startDate dan endDate berdasarkan shift
    const firstShift = filteredShifts[0];
    let startDate = moment(firstShift.start_date).format("YYYY-MM-DD HH:mm:ss");
    let endDate = firstShift.end_date
      ? moment(firstShift.end_date).format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");

    // Proses shift untuk mendapatkan rentang waktu yang tepat
    filteredShifts.forEach(shift => {
      const shiftStartMoment = moment(shift.start_date);
      const shiftEndMoment = shift.end_date ? moment(shift.end_date) : moment();

      // Perbarui startDate dan endDate
      if (shiftStartMoment.isBefore(moment(startDate))) {
        startDate = shiftStartMoment.format("YYYY-MM-DD HH:mm:ss");
      }
      if (shiftEndMoment.isAfter(moment(endDate))) {
        endDate = shiftEndMoment.format("YYYY-MM-DD HH:mm:ss");
      }

      // Akumulasi detail shift
      totalAmount += shift.total_amount || 0;
      totalDiscount += shift.total_discount || 0;
      actualEndingCash += shift.actual_ending_cash || 0;
      cashDifference += shift.cash_difference || 0;
      expectedEndingCash += shift.expected_ending_cash || 0;
      casherNames.push(shift.casher_name || '');
    });

    // Fetch transactions dan expenditures dengan rentang waktu yang didapat
    const transactions = await Transaction.getByAllPaymentReport(
      outlet_id,
      startDate,
      endDate
    );

    const expenditures = await Expenditure.getExpenseReport(outlet_id, startDate, endDate);

    if (transactions.length > 0) {
      const cartIds = [
        ...new Set(transactions.map((transaction) => transaction.cart_id)),
      ];
      const cartDetails = await CartDetail.getByCartIds(cartIds);
      let result = {
        transactions: [...transactions],
        cart_details: cartDetails
          .filter(item => item.qty !== 0)
          .sort((a, b) => a.menu_name.localeCompare(b.menu_name)),
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

      const totalUangCashPengeluaranKeranjang = transactions
        .filter((transaction) => transaction.is_refund_type_all === 1 && transaction.payment_type_id_all === 1)
        .reduce((total, transaction) => total + transaction.total_refund, 0);

      const refundedPerItemIds = transactionsWithRefund
        .filter((transaction) => transaction.is_refund_type_all === 0)
        .map((transaction) => transaction.refund_id);

      let totalUangCashPengeluaranPeritem = 0;
      if (result.refund) {
        totalUangCashPengeluaranPeritem = result.refund[0]
          .filter((refundDetail) => refundedPerItemIds.includes(refundDetail.refund_id) && refundDetail.payment_type_id === 1)
          .reduce((total, refundDetail) => total + refundDetail.total_refund_price, 0);
      }
      const totalUangCashPengeluaran = totalUangCashPengeluaranKeranjang + totalUangCashPengeluaranPeritem;


      const paymentMethods = {};
      transactions.forEach((transaction) => {
        if (transaction.payment_type !== "Tunai") {
          if (!paymentMethods[transaction.payment_type]) {
            paymentMethods[transaction.payment_type] = transaction.total;
          } else {
            paymentMethods[transaction.payment_type] += transaction.total;
          }
        }

        transaction.discount_type =
          transaction.discount_id > 0
            ? 1
            : transaction.transaction_discount_code !== null
              ? 2
              : 0;
      });

      const totalOmset = Object.values(paymentMethods).reduce(
        (sum, value) => sum + value,
        0
      );

      const startDateString = moment(startDate).locale('id').format("dddd, YYYY-MM-DD HH:mm:ss");
      const endDateString = moment(endDate).locale('id').format("dddd, YYYY-MM-DD HH:mm:ss");

      result.payment_reports = {
        uang_cash_rill: totalUangCashSeharusnya - totalUangCashPengeluaran,
        pengeluaran_cash: totalUangCashPengeluaran,
        total_uang_cash_seharusnya:
          totalUangCashSeharusnya,
        ...paymentMethods,
        total_pengeluaran: totalSeluruhPengeluaran,
        total_omset: totalOmset + totalUangCashSeharusnya,
      };

      result.start_date = startDateString;
      result.end_date = endDateString;

      if (shifts.length > 0) {
        result.shift_details = {
          total_amount: totalAmount,
          total_discount: totalDiscount,
          actual_ending_cash: actualEndingCash,
          cash_difference: cashDifference,
          expected_ending_cash: expectedEndingCash,
          casher_name: casherNames.join(', '),
        }
      }
      if (expenditures.totalExpense > 0) {
        result.expenditures = expenditures;
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
      message:
        error.message || "Some error occurred while get the payment report",
    });
  }
};
