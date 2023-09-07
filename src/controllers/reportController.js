exports.getReport = async (req, res) => {
  const { outlet_id, start_date, end_date } = req.query;
  try {


    return res.status(200).json({
      code: 200,
      message: "Laporan berhasil ditampilkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the report",
    });
  }
};
