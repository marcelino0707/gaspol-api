const Menu = require("../models/menu");
exports.createCustomizePrice = async (req, res) => {
  try {
 
    return res.status(200).json({
        code: 200,
        message: "Custom harga menu berhasil!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to customize menu price",
    });
  }
};

exports.updateCustomizePrice = async (req, res) => {
    try {
   
      return res.status(200).json({
          code: 200,
          message: "Custom harga menu berhasil!",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Failed to customize menu price",
      });
    }
  };