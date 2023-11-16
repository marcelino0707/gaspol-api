const ServingType = require("../models/serving_type");
const moment = require("moment-timezone");
const thisTimeNow = moment();
const indoDateTime = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"); 

exports.getServingType = async (req, res) => {
  try {
    const outlet_id = req.params.id;
    const servingTypes = await ServingType.getAllCMS(outlet_id);
 
    return res.status(200).json({
      data: servingTypes,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch serving types",
    });
  }
};

exports.getServingTypeById = async (req, res) => {
  const { id } = req.params;
  try {
    const servingType = await ServingType.getById(id);

    return res.status(200).json({
      data: servingType,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get serving type failed!",
    });
  }
};

exports.createServingType = async (req, res) => {
  try {
    const { name, outlet_id, is_active } = req.body;
    
    const servingType = {
      name: name,
      outlet_id: outlet_id,
      is_active: is_active,
    }

    await ServingType.create(servingType);
    
    return res.status(201).json({
      message: "Serving type created successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create serving types",
    });
  }
};

exports.updateServingType = async (req, res) => {
  try {
    const servingTypeId = req.params.id;
    const { name, is_active } = req.body;
    
    const servingType = {
      name: name,
      is_active: is_active,
      updated_at: indoDateTime,
    }

    await ServingType.update(servingTypeId, servingType);
    
    return res.status(201).json({
      message: "Serving type updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create serving types",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const servingTypeId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    await ServingType.update(servingTypeId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data serving type",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting serving type",
    });
  }
}