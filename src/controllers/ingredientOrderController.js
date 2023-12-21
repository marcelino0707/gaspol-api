const moment = require("moment-timezone");
const IngredientOrderList = require("../models/ingredient_order_list");
const IngredientOrderListDetail = require("../models/ingredient_order_list_detail");
const IngredientType = require("../models/ingredient_type");
const IngredientUnitType = require("../models/ingredient_unit_type");
const Ingredient = require("../models/ingredient");
const Outlet = require("../models/outlet");

exports.getOrderIngredients = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    const outlet = await Outlet.getByOutletId(outlet_id);
    let ingredeintOrderList, ingredientOrderListDetails, ingredientOrderBarListDetails = [];
    const ingredients = await Ingredient.getIngredientByOutletId(outlet_id);
    ingredeintOrderList = await IngredientOrderList.getByOutletId(outlet_id);
    // Create a map for faster lookup of ingredients
    const ingredientMap = new Map(ingredients.map(ingredient => [ingredient.id, ingredient]));
    const ingredientIds = ingredients.filter(
      (ingredient) => ingredient.storage_location_outlet == 1
    ).map((item) => item.id);
    const ingredientBarIds = ingredients.filter(
      (ingredient) => ingredient.storage_location_outlet == 0
    ).map((item) => item.id);

    if(ingredeintOrderList.length == 0) {
      const createdOrderList = await IngredientOrderList.create({
        order_date: moment(indoDateTime).toDate(),
        outlet_id: outlet_id,
        storage_location_outlet: 1
      })

      const orderListId = createdOrderList.insertId;

      await IngredientOrderListDetail.createMultiple(orderListId, ingredientIds);

      const orderListDetails = await IngredientOrderListDetail.getByIngredientOrderListId(orderListId);

      // Combine the data based on ingredient_id
      ingredientOrderListDetails = orderListDetails.map(orderDetail => ({
        ingredient_order_list_detail_id: orderDetail.id,
        ingredient_name: ingredientMap.get(orderDetail.ingredient_id)?.name || null,
        ingredient_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_type_id || null,
        order_quantity: Math.round(ingredientMap.get(orderDetail.ingredient_id)?.order_quantity) || null,
        ingredient_unit_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_unit_type_id || null,
        leftover: orderDetail.leftover,
        order_request_quantity: orderDetail.order_request_quantity,
        real: orderDetail.real
      }));

      if(outlet.is_kitchen_bar_merged == 0) {
        const createdOrderBarList = await IngredientOrderList.create({
          order_date: moment(indoDateTime).toDate(),
          outlet_id: outlet_id,
          storage_location_outlet: 0
        })

        const orderBarListId = createdOrderBarList.insertId;

        await IngredientOrderListDetail.createMultiple(orderBarListId, ingredientBarIds);

        const orderBarListDetails = await IngredientOrderListDetail.getByIngredientOrderListId(orderBarListId);

        // Combine the data based on ingredient_id
        ingredientOrderBarListDetails = orderBarListDetails.map(orderDetail => ({
          ingredient_order_list_detail_id: orderDetail.id,
          ingredient_name: ingredientMap.get(orderDetail.ingredient_id)?.name || null,
          ingredient_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_type_id || null,
          order_quantity: Math.round(ingredientMap.get(orderDetail.ingredient_id)?.order_quantity) || null,
          ingredient_unit_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_unit_type_id || null,
          leftover: orderDetail.leftover,
          order_request_quantity: orderDetail.order_request_quantity,
          real: orderDetail.real
        }));
      }

      ingredeintOrderList = await IngredientOrderList.getByOutletId(outlet_id);
    } else {
      let orderListDetails = await IngredientOrderListDetail.getByIngredientOrderListId(ingredeintOrderList[0].id);

      const existingIngredientIds = orderListDetails.map((item) => item.ingredient_id);
      const missingIngredientIds = ingredientIds.filter((ingredientId) => !existingIngredientIds.includes(ingredientId));
      if(missingIngredientIds.length > 0) {
        await IngredientOrderListDetail.createMultiple(ingredeintOrderList[0].id, missingIngredientIds);
        orderListDetails = await IngredientOrderListDetail.getByIngredientOrderListId(ingredeintOrderList[0].id);
      }

      ingredientOrderListDetails = orderListDetails.map(orderDetail => ({
        ingredient_order_list_detail_id: orderDetail.id,
        ingredient_name: ingredientMap.get(orderDetail.ingredient_id)?.name || null,
        ingredient_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_type_id || null,
        order_quantity: Math.round(ingredientMap.get(orderDetail.ingredient_id)?.order_quantity) || null,
        ingredient_unit_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_unit_type_id || null,
        leftover: orderDetail.leftover,
        order_request_quantity: orderDetail.order_request_quantity,
        real: orderDetail.real
      }));

      if(outlet.is_kitchen_bar_merged == 0) {
        let orderBarListId = await IngredientOrderListDetail.getByIngredientOrderListId(ingredeintOrderList[1].id);

        const existingIngredientIds = orderBarListId.map((item) => item.ingredient_id);
        const missingIngredientIds = ingredientBarIds.filter((ingredientId) => !existingIngredientIds.includes(ingredientId));
        if(missingIngredientIds.length > 0) {
          await IngredientOrderListDetail.createMultiple(ingredeintOrderList[1].id, missingIngredientIds);
          orderBarListId = await IngredientOrderListDetail.getByIngredientOrderListId(ingredeintOrderList[1].id);
        }

        ingredientOrderBarListDetails = orderBarListId.map(orderDetail => ({
          ingredient_order_list_detail_id: orderDetail.id,
          ingredient_name: ingredientMap.get(orderDetail.ingredient_id)?.name || null,
          ingredient_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_type_id || null,
          order_quantity: Math.round(ingredientMap.get(orderDetail.ingredient_id)?.order_quantity) || null,
          ingredient_unit_type_id: ingredientMap.get(orderDetail.ingredient_id)?.ingredient_unit_type_id || null,
          leftover: orderDetail.leftover,
          order_request_quantity: orderDetail.order_request_quantity,
          real: orderDetail.real
        }));
      }
    }

    const ingredientTypes = await IngredientType.getAll();
    const ingredientUnitTypes = await IngredientUnitType.getAll();

    const result = {
      ingredeint_order_lists: ingredeintOrderList,
      ingredient_order_list_details: ingredientOrderListDetails,
      ingredient_order_bar_list_details: ingredientOrderBarListDetails,
      ingredient_types: ingredientTypes,
      ingredient_unit_types: ingredientUnitTypes, 
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
    const { name, ingredient_type_id, ingredient_unit_type_id, storage_location_warehouse_id, ingredient_access } = req.body;
    
    const newIngredient = {
      name: name,
      ingredient_type_id: ingredient_type_id,
      ingredient_unit_type_id: ingredient_unit_type_id,
      storage_location_warehouse_id: storage_location_warehouse_id,
      ingredient_access: ingredient_access
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
    const { name, ingredient_type_id, ingredient_unit_type_id, storage_location_warehouse_id, ingredient_access } = req.body;
    
    const updateIngredient = {
        name: name,
        ingredient_type_id: ingredient_type_id,
        ingredient_unit_type_id: ingredient_unit_type_id,
        storage_location_warehouse_id: storage_location_warehouse_id,
        ingredient_access: ingredient_access,
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