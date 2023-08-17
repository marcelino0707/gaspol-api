const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const ServingType = require("../models/serving_type");
const Discount = require("../models/discount")
const thisTimeNow = new Date();
const deletedAtNow = {
  deleted_at: thisTimeNow,
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getByOutletId(req.query.outlet_id);
    if (!cart) {
      return res.status(404).json({
        message: "Keranjang di Outlet ini sedang kosong",
      });
    }

    const servingTypes = await ServingType.getAll();
    const cartDetails = await CartDetail.getByCartId(cart.id);

    for (const cartDetail of cartDetails) {
      const servingType = servingTypes.find((type) => type.id == cartDetail.serving_type_id);
      cartDetail.serving_type_name = servingType.name;
      delete cartDetail.discount_id;    
    }

    const result = {
      cart_id: cart.id,
      subtotal: cart.subtotal,
      total: cart.total,
      cart_details: cartDetails,
    };

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
      const discounts = await Discount.getAll();
      const discount = discounts.find((type) => type.id == discount_id);
      if(cartDetailTotalPrice < discount.min_purchase) {
        return res.status(400).json({
          message: "Minimal pembelian belum cukup untuk menggunakan diskon",
        });
      } else {
        if(discount.is_percent == true) {
          cartDetailTotalPrice = (cartDetailTotalPrice * (100 - discount.value)) / 100;
        } else {
          cartDetailTotalPrice = cartDetailTotalPrice - discount.value
        }
      }
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
    });

    return res.status(201).json({
      message: "Menu berhasil ditambahkan ke dalam keranjang!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the cart",
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
  const { outlet_id } = req.body;
  const cart_detail_id = req.params.id;
  const { menu_id, menu_detail_id, serving_type_id, discount_id, price, qty, note_item } = req.body;

  const updatedCartItems = {
    menu_id,
    serving_type_id,
    price,
    qty,
    note_item,
    updated_at: thisTimeNow,
  };

  if (menu_detail_id) {
    updatedCartItems.menu_detail_id = menu_detail_id;
  } else {
    updatedCartItems.menu_detail_id = null;
  }

  if (discount_id) {
    updatedCartItems.discount_id = discount_id;
  }

  try {  
    const cart = await Cart.getByOutletId(outlet_id);
    const cartDetail = await CartDetail.getByCartDetailId(cart_detail_id);
    const oldSubtotalReduce = cart.subtotal - cartDetail.total_price;
    const cartDetailTotalPrice = price * qty;

    if (qty == 0) {
      updatedCartItems.deleted_at = thisTimeNow;
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
    return res.status(500).json({
      message: error.message || "Some error occurred while updating the cart",
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
      total: totalCart
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
