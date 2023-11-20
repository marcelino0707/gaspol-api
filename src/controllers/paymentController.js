const PaymentType = require("../models/payment_type");

exports.getPaymentType = async (req, res) => {
  try {
    const outlet_id = req.params.id;
    const paymentTypes = await PaymentType.getAll(outlet_id);

    return res.status(200).json({
      data: paymentTypes,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch payment types",
    });
  }
};
