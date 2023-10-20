const CustomPrice = require("../models/custom_price");
exports.getCustomizePriceById = async (req, res) => {
  const customPriceId = req.params.id;

  try {

    
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Customize Price Failed!",
    });
  }
};

exports.updateCustomizePrice = async (req, res) => {
    try {
      const customPriceId = req.params.id;
      const { menu_id, menu_detail_id, price, custom_price_id } = req.body;

      const updatedCustomPrice = {
        menu_id : menu_id,
        menu_detail_id: menu_detail_id,
        custom_price_id: custom_price_id,
        price: price,
      }

      await CustomPrice.update(customPriceId, updatedCustomPrice);

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