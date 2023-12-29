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
    
    let startDate, endDate;
    if (thisTimeNow.hours() >= 0) {
      startDate = moment(indoDateTime).set({ hour: 0, minute: 0, second: 0 }).toDate();
      endDate = moment(indoDateTime).set({ hour: 4, minute: 30, second: 0 }).toDate();
    } else {
      startDate = moment(indoDateTime).set({ hour: 4, minute: 30, second: 1 }).toDate();
      endDate = moment(indoDateTime).add(1, 'days').set({ hour: 4, minute: 30, second: 0 }).toDate();
    }

    ingredeintOrderList = await IngredientOrderList.getByOutletId(outlet_id, startDate, endDate);
    
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

      if(ingredientIds.length > 0) {
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
          leftover: Math.round(orderDetail.leftover),
          order_request_quantity: Math.round(orderDetail.order_request_quantity),
          real: Math.round(orderDetail.real)
        }));
      }


      if(outlet.is_kitchen_bar_merged == 0) {
        const createdOrderBarList = await IngredientOrderList.create({
          order_date: moment(indoDateTime).toDate(),
          outlet_id: outlet_id,
          storage_location_outlet: 0
        })

        if(ingredientBarIds.length > 0) {
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
            leftover: Math.round(orderDetail.leftover),
            order_request_quantity: Math.round(orderDetail.order_request_quantity),
            real: Math.round(orderDetail.real)
          }));
        }
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
        leftover: Math.round(orderDetail.leftover),
        order_request_quantity: Math.round(orderDetail.order_request_quantity),
        real: Math.round(orderDetail.real)
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
          leftover: Math.round(orderDetail.leftover),
          order_request_quantity: Math.round(orderDetail.order_request_quantity),
          real: Math.round(orderDetail.real)
        }));
      }
    }

    const ingredientTypes = await IngredientType.getAll();
    const ingredientUnitTypes = await IngredientUnitType.getAll();
    const newDatetimeFormat = thisTimeNow.tz("Asia/Jakarta");
    const dateTimeNowFormat = newDatetimeFormat.format("dddd, D MMMM YYYY - HH:mm");
    const result = {
      date_time_now: dateTimeNowFormat,
      ingredient_order_lists: ingredeintOrderList,
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

exports.updateOrderIngredients = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const { ingredient_order_lists, ingredient_order_list_details } = req.body;
    
    const updatedIngredientOrderLists = ingredient_order_lists.map((list) => ({
      ...list,
      updated_at: moment(indoDateTime).format("YYYY-MM-DD HH:mm:ss"),
    }));

    const updatedIngredientOrderListDetails = ingredient_order_list_details.map((detail) => {
      const { ingredient_order_list_detail_id, ...restDetail } = detail;
      return {
        ...restDetail,
        id: ingredient_order_list_detail_id,
        updated_at: moment(indoDateTime).format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    await IngredientOrderList.updateMultiple(updatedIngredientOrderLists);
    await IngredientOrderListDetail.updateMultiple(updatedIngredientOrderListDetails);

    return res.status(201).json({
      message: "Order Ingredient updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update order ingredient",
    });
  }
};

exports.getOrderIngredientsOutlet = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    let ingredeintOrderList = [];
    const startDate = moment(indoDateTime).subtract(1, 'days').set({ hour: 4, minute: 3, second: 1 }).toDate();
    const endDate = moment(indoDateTime).set({ hour: 4, minute: 3, second: 0 }).toDate();
    if(outlet_id) {
      ingredeintOrderList = await IngredientOrderList.getByOutletId(outlet_id, startDate, endDate);
    } else {
      ingredeintOrderList = await IngredientOrderList.getAll(startDate, endDate);
    }

    const ingredientOrderListIds = ingredeintOrderList.map(
      (list) => list.id
    );
    
    const ingredientOrderListDetails = await IngredientOrderListDetail.getByIngredientOrderListIds(ingredientOrderListIds);
      
    const outlet_ids = ingredeintOrderList.map(
      (list) => list.outlet_id
    );

    const outlets = await Outlet.getByOutletIds(outlet_ids);

    const orderLists = ingredeintOrderList.map((orderList) => {
      const details = ingredientOrderListDetails.filter((detail) => detail.ingredient_order_list_id === orderList.id);
      return {
        ...orderList,
        ingredientOrderListDetails: details,
      };
    });

    const ingredientTypes = await IngredientType.getAll();
    const ingredientUnitTypes = await IngredientUnitType.getAll();
    const newDatetimeFormat = thisTimeNow.tz("Asia/Jakarta");
    const dateTimeNowFormat = newDatetimeFormat.format("dddd, D MMMM YYYY - HH:mm");
    const result = {
      date_time_now: dateTimeNowFormat,
      outlets, 
      ingredient_types: ingredientTypes,
      ingredient_unit_types: ingredientUnitTypes, 
      order_lists: orderLists,
    }

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch ingredients order outlet",
    });
  }
}