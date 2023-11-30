const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount")
const Transaction = require("../models/transaction");
const Outlet = require("../models/outlet");
const { applyDiscountAndUpdateTotal } = require("../utils/generalFunctions");
const moment = require("moment-timezone");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.getByOutletId(req.query.outlet_id);
    let isQueuing = false;
    if (!cart) {
      cart = await Cart.getQueuingByOutletId(req.query.outlet_id);
      if(!cart) {
        return res.status(404).json({
          message: "Keranjang di Outlet ini sedang kosong",
        });
      } else {
        isQueuing = true;
      }
    }

    const cartDetails = await CartDetail.getByCartId(cart.id);
    
    const result = {
      customer_name: "",
      customer_seat: "",
      cart_id: cart.id,
      subtotal: cart.subtotal,
      total: cart.total,
      cart_details: cartDetails,
    };

    if(!isQueuing) {
      const transaction = await Transaction.getByCartId(cart.id);
      if(transaction) {
        result.customer_name = transaction.customer_name;
        result.customer_seat = transaction.customer_seat;
      }
    }

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch carts",
    });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const { id } = req.params;
    const cartDetail = await CartDetail.getByCartDetailId(id);
    return res.status(200).json({
      data: cartDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch carts",
    });
  }
};

exports.createCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate(); 
  const { outlet_id, menu_id, menu_detail_id, serving_type_id, discount_id, price, qty, note_item } = req.body;
  try {
    const cart = await Cart.getByOutletId(outlet_id);
    let cartDetailTotalPrice = price * qty;
    
    let cartId, subTotalPrice = 0;
    
    const discount = await Discount.getById(discount_id);
    if(discount_id != 0) {
      discountedPrice = await applyDiscountAndUpdateTotal(price, qty, discount.is_percent, discount.value, discount.min_purchase, discount.max_discount, discount.is_discount_cart, null);
      cartDetailTotalPrice = discountedPrice;
    }

    if (cart) {
      cartId = cart.id;
      subTotalPrice = cart.subtotal;
    } else {
      let newCart = {};
      newCart.outlet_id = outlet_id;
      const createdCart = await Cart.create(newCart);
      cartId = createdCart.insertId;
    }

    const newCartDetail = {
      cart_id: cartId,
      menu_id: menu_id,
      serving_type_id: serving_type_id,
      price: price,
      qty: qty,
      total_price: cartDetailTotalPrice,
    };

    if (discount_id != 0) {
      newCartDetail.discount_id = discount_id;
      const discountedPricePercent = discountedPrice / qty;
      newCartDetail.discounted_price = Math.max(100, Math.ceil(discountedPricePercent / 100) * 100);
    }

    if (menu_detail_id) {
      newCartDetail.menu_detail_id = menu_detail_id;
    }

    if (note_item) {
      newCartDetail.note_item = note_item;
    }

    await CartDetail.create(newCartDetail);

    subTotalPrice = subTotalPrice + cartDetailTotalPrice;

    await Cart.update(cartId, {
      subtotal: subTotalPrice,
      total: subTotalPrice,
      discount_id: null,
      updated_at: indoDateTime,
    });

    return res.status(201).json({
      message: "Menu berhasil ditambahkan ke dalam keranjang!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || "Some error occurred while creating the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};

exports.updateCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate(); 
  const cart_detail_id = req.params.id;
  const { outlet_id, menu_id, menu_detail_id, serving_type_id, discount_id, price, qty, note_item } = req.body;

  const updatedCartItems = {
    menu_id,
    serving_type_id,
    price,
    qty,
    note_item,
    updated_at: indoDateTime,
  };

  if (menu_detail_id) {
    updatedCartItems.menu_detail_id = menu_detail_id;
  } else {
    updatedCartItems.menu_detail_id = null;
  }

  try {  
    const cart = await Cart.getByOutletId(outlet_id);
    const cartDetail = await CartDetail.getByCartDetailId(cart_detail_id);
    const oldSubtotalReduce = cart.subtotal - cartDetail.total_price;
    let cartDetailTotalPrice = price * qty;

    if (qty == 0) {
      updatedCartItems.deleted_at = indoDateTime;
    }

    // if(cartDetail.discount_id != 0) {
      if(discount_id == 0 || discount_id == null) {
        updatedCartItems.discount_id = 0;
        updatedCartItems.discounted_price = 0;
      } else {
        const discount = await Discount.getById(discount_id);
        discountedPrice = await applyDiscountAndUpdateTotal(price, qty, discount.is_percent, discount.value, discount.min_purchase, discount.max_discount, discount.is_discount_cart, null);
        cartDetailTotalPrice = discountedPrice * qty;
        const discountedPricePercent = discountedPrice / qty;
        updatedCartItems.discounted_price = Math.max(100, Math.ceil(discountedPricePercent / 100) * 100);
        updatedCartItems.discount_id = discount_id;
      }
    // }

    updatedCartItems.total_price = cartDetailTotalPrice;
  
    await CartDetail.update(cart_detail_id, updatedCartItems);

    const subTotalPrice = oldSubtotalReduce + cartDetailTotalPrice;
    const updateSubtotal = {
      subtotal: subTotalPrice,
      total: subTotalPrice,
      discount_id: null,
      updated_at: indoDateTime,
    };
    await Cart.update(cart.id, updateSubtotal);

    return res.status(200).json({
      message: "Keranjang berhasil diubah!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || "Some error occurred while updating the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};

exports.deleteCartItems = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate(); 
  try {
    const cart_detail_id = req.params.id;
    const { outlet_id } = req.query;
    const cart = await Cart.getByOutletId(outlet_id);
    const cartDetails = await CartDetail.getByCartDetailId(cart_detail_id);
    totalCart = cart.subtotal - cartDetails.total_price;

    const updateCost = {
      subtotal: totalCart,
      total: totalCart,
      discount_id: null,
      updated_at: indoDateTime,
    };

    await Cart.update(cart.id, updateCost);
    await CartDetail.update(cartDetails.cart_detail_id, {
      deleted_at: indoDateTime,
    });

    return res.status(200).json({
      message: "Berhasil menghapus menu dari keranjang",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting item cart",
    });
  }
};

exports.deleteCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate(); 
  try {
    const { outlet_id, cart_id, pin, cancel_reason } = req.body;
    const outlet = await Outlet.getByOutletId(outlet_id);
    if (outlet.pin != pin) {
      return res.status(401).json({
        code: 401,
        message: "Pin Salah!",
      });
    } else {
      if(cancel_reason) {
        if(cart_id) {
          await Cart.update(cart_id, {
            is_canceled: 1,
            cancel_reason: cancel_reason,
            is_active: false,
            updated_at: indoDateTime,
          });
        } else {
          await CartDetail.updateAllByCartId(cart_id, {
            deleted_at: indoDateTime,
          });
      
          const deleteCost = {
            subtotal: 0,
            total: 0,
            discount_id: null,
            updated_at: indoDateTime,
          };
      
          await Cart.update(cart_id, deleteCost);
        }
      }
  
      return res.status(200).json({
        code: 200,
        message: "Berhasil menghapus data keranjang",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting cart",
    });
  }
};

exports.splitCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate(); 
  const { outlet_id, cart_id, cart_details } = req.body;
  try {
    const newCart = await Cart.create({
      outlet_id: outlet_id,
    });
    const newCartID = newCart.insertId;
    let subtotalNewCart = 0;
    for (const cartDetail of cart_details) {
      const oldCartDetail = await CartDetail.getByCartDetailId(cartDetail.cart_detail_id);
      const oldTotalPriceItem = oldCartDetail.price * (oldCartDetail.qty - cartDetail.qty_to_split);
      const newTotalPriceItem = oldCartDetail.price * cartDetail.qty_to_split;
      
      const newCartDetail = {
        cart_id: newCartID,
        menu_id: oldCartDetail.menu_id,
        serving_type_id: oldCartDetail.serving_type_id,
        qty: cartDetail.qty_to_split,
        total_price: newTotalPriceItem,
      }

      if(oldCartDetail.menu_detail_id != null) {
        newCartDetail.menu_detail_id = oldCartDetail.menu_detail_id;
      }

      if(oldCartDetail.note_item) {
        newCartDetail.note_item = oldCartDetail.note_item;
      }

      await CartDetail.create(newCartDetail);

      await CartDetail.update(cartDetail.cart_detail_id,{
        discount_id: 0,
        discounted_price: null,
        qty: oldCartDetail.qty - cartDetail.qty_to_split,
        total_price: oldTotalPriceItem,
      });

      subtotalNewCart = subtotalNewCart + newTotalPriceItem;
    }

    const oldCartDetails = await CartDetail.getByCartId(cart_id);
    if(oldCartDetails) {
      let subtotalCart = 0;
      for(const oldCartDetail of oldCartDetails) {
        let subtotalCartDetail = oldCartDetail.qty * oldCartDetail.price;
        if(oldCartDetail.discount_id != 0) {
          subtotalCartDetail = oldCartDetail.total_price;
        }
        subtotalCart = subtotalCart + subtotalCartDetail;
      }

      await Cart.update(cart_id, {
        subtotal: subtotalCart,
        total: subtotalCart,
        discount_id: null,
        updated_at: indoDateTime,
        is_active: 0, 
        is_queuing: 1,
      })
    }

    await Cart.update(newCartID, {
      subtotal: subtotalNewCart,
      total: subtotalNewCart,
      updated_at: indoDateTime,
      is_active: 1, 
      is_queuing: 0,
    })

    return res.status(201).json({
      message: "Cart berhasil dipisah!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || "Some error occurred while separate the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};