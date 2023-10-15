const Transaction = require("../models/transaction");
const thisTimeNow = new Date();

exports.getReport = async (req, res) => {
  const { outlet_id, start_date, end_date, is_success, is_pending } = req.query;
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

      console.log(startDate);
    }

    const transactions = await Transaction.getAllReport(outlet_id, startDate, endDate, is_success, is_pending);
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
