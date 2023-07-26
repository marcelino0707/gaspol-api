const Discount = require("../models/discount");

exports.getDiscounts = async (req, res) => {
  try {
    const discount = await Discount.getAll();
 
    return res.status(200).json({
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch discounts",
    });
  }
};