const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount")
const Transaction = require("../models/transaction");
const { applyDiscountAndUpdateTotal } = require("../utils/generalFunctions");
const moment = require("moment-timezone");
const thisTimeNow = moment();
const indoDateTime = thisTimeNow.tz("Asia/Jakarta"); 
const deletedAtNow = {
  deleted_at: indoDateTime,
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getByOutletId(req.query.outlet_id);
    if (!cart) {
      return res.status(404).json({
        message: "Keranjang di Outlet ini sedang kosong",
      });
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

    const transaction = await Transaction.getByCartId(cart.id);
    if(transaction) {
      result.customer_name = transaction.customer_name;
      result.customer_seat = transaction.customer_seat;
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

exports.createCart = async (req, res) => {
  const { outlet_id, menu_id, menu_detail_id, serving_type_id, discount_id, price, qty, note_item } = req.body;
  try {
    const cart = await Cart.getByOutletId(outlet_id);
    let cartDetailTotalPrice = price * qty;
    
    let cartId, subTotalPrice = 0;
    
    if(discount_id != 0) {
      const discount = await Discount.getById(discount_id);
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
      newCartDetail.discounted_price = discountedPrice / qty;
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

exports.updateCart = async (req, res) => {
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

    if(cartDetail.discount_id != 0) {
      if(discount_id == 0) {
        updatedCartItems.discount_id = 0;
      } else {
        const discount = await Discount.getById(discount_id);
        discountedPrice = await applyDiscountAndUpdateTotal(price, qty, discount.is_percent, discount.value, discount.min_purchase, discount.max_discount, discount.is_discount_cart, null);
        cartDetailTotalPrice = discountedPrice * qty;
        updatedCartItems.discounted_price = discountedPrice;
      }
    }

    updatedCartItems.total_price = cartDetailTotalPrice;
  
    await CartDetail.update(cart_detail_id, updatedCartItems);

    const subTotalPrice = oldSubtotalReduce + cartDetailTotalPrice;
    const updateSubtotal = {
      subtotal: subTotalPrice,
      total: subTotalPrice,
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

exports.deleteCart = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const cart = await Cart.getByOutletId(outlet_id);
    await CartDetail.deleteAllByCartId(cart.id, deletedAtNow);

    const deleteCost = {
      subtotal: 0,
      total: 0,
      updated_at: indoDateTime,
    };

    await Cart.update(cart.id, deleteCost);

    return res.status(200).json({
      message: "Berhasil menghapus data keranjang",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting cart",
    });
  }
};

exports.deleteCartItems = async (req, res) => {
  try {
    const cart_detail_id = req.params.id;
    const { outlet_id } = req.query;
    const cart = await Cart.getByOutletId(outlet_id);
    const cartDetails = await CartDetail.getByCartDetailId(cart_detail_id);
    totalCart = cart.subtotal - cartDetails.total_price;

    const updateCost = {
      subtotal: totalCart,
      total: totalCart,
      updated_at: indoDateTime,
    };

    await Cart.update(cart.id, updateCost);
    await CartDetail.update(cartDetails.cart_detail_id, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus menu dari keranjang",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting item cart",
    });
  }
};
