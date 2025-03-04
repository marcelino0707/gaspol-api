const CustomPrice = require("../models/custom_price");
const ServingType = require("../models/serving_type");
const moment = require("moment-timezone");

exports.getCustomizePriceByMenuId = async (req, res) => {
  const menuId = req.params.id;

  try {
    const allCustomPrices = await ServingType.getAllCMS();
    const customMenuPrices = await CustomPrice.getCustomMenuPricesByMenuIdCMS(
      menuId
    );
    const result = {
      custom_prices: allCustomPrices,
      custom_menu_prices: customMenuPrices.map((item) => {
        const customPrice = allCustomPrices.find(
          (price) => price.id === item.serving_type_id
        );
        return {
          ...item,
          custom_price_name: customPrice ? customPrice.name : null,
        };
      }),
    };
    return res.status(200).json({
      code: 200,
      message: "Custom harga menu berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Customize Price Failed!",
    });
  }
};

exports.updateCustomizePrice = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const menuId = req.params.id;
    const { custom_prices } = req.body;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    if (custom_prices) {
      const customPrices = custom_prices;
      const oldCustomPrices = await CustomPrice.getCustomMenuPricesByMenuIdCMS(
        menuId
      );
      const oldCustomPriceIds = oldCustomPrices.map((item) => item.id);
      const customPriceIds = customPrices
        .filter((item) => item.id !== undefined)
        .map((item) => item.id);
      const customPriceIdsToDelete = oldCustomPriceIds.filter(
        (id) => !customPriceIds.includes(id)
      );

      for (const customPrice of customPrices) {
        if (customPrice.id == undefined) {
          await CustomPrice.create({
            menu_id: menuId,
            menu_detail_id: customPrice.menu_detail_id,
            serving_type_id: customPrice.serving_type_id,
            price: customPrice.price,
          });
        } else {
          const updatedCustomPrice = {
            price: customPrice.price,
            updated_at: indoDateTime,
          };

          await CustomPrice.update(customPrice.id, updatedCustomPrice);
        }
      }

      if (customPriceIdsToDelete.length > 0) {
        for (const customPriceIdToDelete of customPriceIdsToDelete) {
          await CustomPrice.update(customPriceIdToDelete, deletedAtNow);
        }
      }
    }

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
