const Ingredient = require("../models/ingredient");
const Outlet = require("../models/outlet");
const IngredientType = require("../models/ingredient_type");
const IngredientUnitType = require("../models/ingredient_unit_type");
const StorageLocationWarehouse = require("../models/storage_location_warehouse");
const moment = require("moment-timezone");

exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.getAll();
    const ingredientTypes = await IngredientType.getAll();
    const ingredientUnitTypes = await IngredientUnitType.getAll();
    const storageLocationWarehouses = await StorageLocationWarehouse.getAll();
    const outlets = await Outlet.getAllDropdown();
    const result = {
      ingredients, ingredientTypes, ingredientUnitTypes, storageLocationWarehouses, outlets
    }
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch ingredients",
    });
  }
};

exports.getIngredientById = async (req, res) => {
  const { id } = req.params;
  try {
    const ingredient = await Ingredient.getByIngredientId(id);
    return res.status(200).json({
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get ingredient failed!",
    });
  }
};

exports.createIngredient = async (req, res) => {
  try {
    const { name, ingredient_type_id, ingredient_unit_type_id, storage_location_warehouse_id, ingredient_access, storage_location_outlet, order_quantity } = req.body;
    
    const newIngredient = {
      name: name,
      ingredient_type_id: ingredient_type_id,
      ingredient_unit_type_id: ingredient_unit_type_id,
      storage_location_warehouse_id: storage_location_warehouse_id,
      ingredient_access: ingredient_access,
      order_quantity: order_quantity,
      storage_location_outlet: storage_location_outlet,
    }

    await Ingredient.create(newIngredient);
    
    return res.status(201).json({
      message: "Ingredient created successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create ingredient",
    });
  }
};

exports.updateIngredient = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const ingredientId = req.params.id;
    const { name, ingredient_type_id, ingredient_unit_type_id, storage_location_warehouse_id, ingredient_access, storage_location_outlet, order_quantity } = req.body;
    
    const updateIngredient = {
        name: name,
        ingredient_type_id: ingredient_type_id,
        ingredient_unit_type_id: ingredient_unit_type_id,
        storage_location_warehouse_id: storage_location_warehouse_id,
        ingredient_access: ingredient_access,
        order_quantity: order_quantity,
        storage_location_outlet: storage_location_outlet,
        updated_at: indoDateTime,
    }

    await Ingredient.update(ingredientId, updateIngredient);
    
    return res.status(201).json({
      message: "Ingredient updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update ingredient",
    });
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    const ingredientId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    await Ingredient.update(ingredientId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data ingredient",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting ingredient",
    });
  }
}