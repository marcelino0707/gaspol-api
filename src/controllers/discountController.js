const Discount = require("../models/discount");
const moment = require("moment-timezone");

exports.getDiscounts = async (req, res) => {
  const { is_discount_cart, outlet_id } = req.query;
  try {
    const discount = await Discount.getAll(outlet_id, is_discount_cart);
    return res.status(200).json({
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch discounts",
    });
  }
};

exports.getDiscountsV2 = async (req, res) => {
  const { outlet_id } = req.query;
  try {
    const discounts = await Discount.getAllV2(outlet_id);
    return res.status(200).json({
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch discounts",
    });
  }
};

exports.getDiscountById = async (req, res) => {
  const { id } = req.params;
  try {
    const discount = await Discount.getById(id);

    return res.status(200).json({
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get discount Failed!",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount, outlet_id } = req.body;

    const discount = {
      code: code,
      is_percent: is_percent,
      is_discount_cart: is_discount_cart,
      value: value,
      outlet_id: outlet_id,
      start_date: start_date || null,
      end_date: end_date || null,
      min_purchase: min_purchase || null,
      max_discount: max_discount || null,
    };

    await Discount.create(discount);

    return res.status(201).json({
      message: "Data discount berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating new discount",
    });
  }
};

exports.update = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const discountId = req.params.id;
    const { code, is_percent, is_discount_cart, value, start_date, end_date, min_purchase, max_discount, outlet_id } = req.body;

    const updatedDiscount = {
      code: code,
      is_percent: is_percent,
      is_discount_cart: is_discount_cart,
      value: value,
      start_date: start_date,
      end_date: end_date,
      min_purchase: min_purchase,
      max_discount: max_discount,
      outlet_id: outlet_id,
      updated_at: indoDateTime,
    };

    await Discount.update(discountId, updatedDiscount);

    return res.status(200).json({
      message: "Berhasil mengubah data discount!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update discount",
    });
  }
};

exports.delete = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const discountId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    await Discount.update(discountId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data discount",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting discount",
    });
  }
}