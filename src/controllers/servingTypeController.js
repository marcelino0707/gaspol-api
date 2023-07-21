const ServingType = require("../models/serving_type");

exports.getServingType = async (req, res) => {
  try {
    const servingTypes = await ServingType.getAll();
 
    return res.status(200).json({
      data: servingTypes,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch serving types",
    });
  }
};