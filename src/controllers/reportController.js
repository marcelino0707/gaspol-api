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

    const turnoversByDate = transactions.reduceRight((result, transaction) => {
      const { invoice_due_date, payment_type_id, payment_type, customer_cash, customer_change } = transaction;
      // Skip transactions without invoice_due_date
      if (invoice_due_date !== null) {
        const totalTransactionAmount = customer_cash - customer_change;
    
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
  const thisTimeNow = moment();
  const { outlet_id, start_date, end_date, is_shift } = req.query;
  try {
    let startDate, endDate, startDateShow;
    if (start_date && end_date) {
      startDate = moment(start_date).startOf('day').add(6, 'hours').format("YYYY-MM-DD HH:mm:ss");
      endDate = moment(end_date).endOf('day').add(5, 'hours').add(59, 'minutes').add(59, 'seconds').format("YYYY-MM-DD HH:mm:ss");
    } else {
      const dateNow = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD");
      startDate = moment.tz(dateNow, "Asia/Jakarta").startOf('day').add(6, 'hours').format("YYYY-MM-DD HH:mm:ss");
      endDate = moment.tz(dateNow, "Asia/Jakarta").add(1, 'days').endOf('day').add(5, 'hours').add(59, 'minutes').add(59, 'seconds').format("YYYY-MM-DD HH:mm:ss");
    }
    startDateShow = startDate;

    let shifts = [], totalAmount = 0, totalDiscount = 0, casherNames = [], actualEndingCash = 0, cashDifference = 0, expectedEndingCash = 0;
    if (is_shift && is_shift != 0) {
      shifts = await ShiftReport.getShiftByShiftNumber(outlet_id, startDate, endDate, is_shift);
    } else {
      shifts = await ShiftReport.getShiftByShiftNumber(outlet_id, startDate, endDate);
    }

    if (shifts.length > 0) {
      let minStartDate = moment(shifts[0].start_date); 
      let maxEndDate = moment(endDate);
      startDateShow =  moment(shifts[0].start_date);
      if(shifts[0].end_date) {
        maxEndDate = moment(shifts[0].end_date)
      }

      for (const shift of shifts) {
        const shiftStartDate = moment(shift.start_date);
        const shiftEndDate = moment(shift.end_date);
        const shiftStartDateShow = moment(shift.start_date);

        if (shiftStartDate.isBefore(minStartDate)) {
          minStartDate = shiftStartDate;
        }

        if (shift.end_date && shiftEndDate.isAfter(maxEndDate)) {
          maxEndDate = shiftEndDate;
        }

        if (shiftStartDateShow.isBefore(startDateShow)) {
          startDateShow = shiftStartDateShow;
        }

        totalAmount = totalAmount + shift.total_amount;
        totalDiscount = totalDiscount + shift.total_discount;
        actualEndingCash = actualEndingCash + shift.actual_ending_cash;
        cashDifference = cashDifference + shift.cash_difference;
        expectedEndingCash = expectedEndingCash + shift.expected_ending_cash;
        casherNames.push(shift.casher_name);
      }

      startDate = minStartDate.format("YYYY-MM-DD HH:mm:ss");
      endDate = maxEndDate.format("YYYY-MM-DD HH:mm:ss");
    }

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

      const startDateString = moment(startDateShow).locale('id').format("dddd, YYYY-MM-DD HH:mm:ss");
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
