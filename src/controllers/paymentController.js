const PaymentType = require("../models/payment_type");
const PaymentCategory = require("../models/payment_category")
const moment = require("moment-timezone");

// for kasir
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

// cms
exports.getPaymentTypesCMS = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const paymentTypes = await PaymentType.getAllCMS(outlet_id);
    const paymentCategories = await PaymentCategory.getAll(outlet_id);
    const result = {
      payment_type: paymentTypes,
      payment_categories: paymentCategories,
    }
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch payment types",
    });
  }
};

exports.getPaymentTypesById = async (req, res) => {
  const { id } = req.params;
  try {
    const paymentType = await PaymentType.getPaymentTypeById(id);
    
    return res.status(200).json({
      data: paymentType,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Payment Failed!",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, payment_category_id, outlet_id } = req.body;

    const payment = {
      name: name,
      payment_category_id: payment_category_id,
      outlet_id: outlet_id,
    };

    await PaymentType.create(payment);

    return res.status(201).json({
      message: "Data payment berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating new payment",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    const paymentId = req.params.id;
    const { name, payment_category_id, is_active } = req.body;

    const updatedPayment = {
      name: name,
      payment_category_id: payment_category_id,
      is_active: is_active,
      updated_at: indoDateTime,
    };

    await PaymentType.update(paymentId, updatedPayment);

    return res.status(200).json({
      message: "Berhasil mengubah data payment!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update payment",
    });
  }
};

exports.updatePaymentOrder = async (req, res) => {
  const { paymentTypesOrder } = req.body; // this should be the array of payment types with their updated order

  try {
    // Update the order of each payment type
    for (const [index, paymentType] of paymentTypesOrder.entries()) {
      const updatedPayment = {
        order: index + 1, // 1-based index for order
      };
      await PaymentType.update(paymentType.id, updatedPayment);
    }

    return res.status(200).json({
      message: "Payment types order updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update payment types order",
    });
  }
};


exports.delete = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const paymentId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    await PaymentType.update(paymentId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data payment",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting payment",
    });
  }
};