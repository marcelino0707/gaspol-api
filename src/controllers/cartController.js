const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount");
const Transaction = require("../models/transaction");
const Outlet = require("../models/outlet");
const {
  applyDiscountAndUpdateTotal
} = require("../utils/generalFunctions");
const moment = require("moment-timezone");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.getByOutletId(req.query.outlet_id);
    if (!cart) {
      cart = await Cart.getQueuingByOutletId(req.query.outlet_id);
      if (!cart) {
        return res.status(200).json({
          message: "Keranjang di Outlet ini sedang kosong",
          data: null
        });
      } else {
        await Cart.update(cart.id, {
          is_active: true,
          is_queuing: false
        })
      }
    }

    const cartDetails = await CartDetail.getByCartId(cart.id, false);

    const result = {
      customer_name: "",
      customer_seat: "",
      discount_id: cart.discount_id || 0,
      cart_id: cart.id,
      is_splitted: 0,
      subtotal: cart.subtotal,
      total: cart.total,
      cart_details: cartDetails,
    };

    const transaction = await Transaction.getByCartId(cart.id);
    if (transaction) {
      result.customer_name = transaction.customer_name;
      result.customer_seat = transaction.customer_seat;
    }
    
    if(cart.cart_id_main_split != null) {
      const savedBill = await Transaction.getSavedBillByCartId(cart.cart_id_main_split);
      if (savedBill) {
        result.is_splitted = 1;
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
    const {
      id
    } = req.params;
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
  const {
    outlet_id,
    menu_id,
    menu_detail_id,
    serving_type_id,
    discount_id,
    price,
    qty,
    note_item,
  } = req.body;
  try {
    const cart = await Cart.getByOutletId(outlet_id);
    let cartDetailTotalPrice = price * qty;
    const cartDetailSubtotalPrice = cartDetailTotalPrice;
    let cartId,
      subTotalPrice = 0,
      totalPrice = 0;

    if (discount_id && discount_id != 0) {
      const discount = await Discount.getById(discount_id);
      const discountedPrice = await applyDiscountAndUpdateTotal(
        price,
        qty,
        discount.is_percent,
        discount.value,
        discount.min_purchase,
        discount.max_discount,
        discount.is_discount_cart,
        null
      );
      cartDetailTotalPrice = discountedPrice;
    }

    if (cart) {
      cartId = cart.id;
      subTotalPrice = cart.subtotal;
      totalPrice = cart.total;
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
      subtotal_price: cartDetailSubtotalPrice,
      total_price: cartDetailTotalPrice,
    };

    if (discount_id && discount_id != 0) {
      newCartDetail.discount_id = discount_id;
      const discountedPricePercent = cartDetailTotalPrice / qty;
      newCartDetail.discounted_price = Math.max(
        100,
        Math.ceil(discountedPricePercent / 100) * 100
      );
    }

    if (menu_detail_id) {
      newCartDetail.menu_detail_id = menu_detail_id;
    }

    if (note_item) {
      newCartDetail.note_item = note_item;
    }

    await CartDetail.create(newCartDetail);

    subTotalPrice = subTotalPrice + cartDetailSubtotalPrice;
    totalPrice = totalPrice + cartDetailTotalPrice;
    if (cart && cart.discount_id > 0) {
      totalPrice = cart.subtotal + cartDetailTotalPrice;
    }

    await Cart.update(cartId, {
      subtotal: subTotalPrice,
      total: totalPrice,
      discount_id: 0,
      updated_at: indoDateTime,
    });

    return res.status(201).json({
      message: "Menu berhasil ditambahkan ke dalam keranjang!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage =
      error.message || "Some error occurred while creating the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};

exports.updateCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  const cart_detail_id = req.params.id;
  const {
    outlet_id,
    menu_id,
    menu_detail_id,
    serving_type_id,
    discount_id,
    price,
    qty,
    note_item,
    cancel_reason,
    pin
  } = req.body;

  try {
    const cartDetail = await CartDetail.getByCartDetailId(cart_detail_id);
    if(cartDetail.is_ordered == 1) {
      const outlet = await Outlet.getByOutletId(outlet_id);
      if (outlet.pin != pin) {
        return res.status(401).json({
          code: 401,
          message: "Pin Salah!",
        });
      }
    }

    if(qty == 0) {
      return res.status(401).json({
        code: 401,
        message: "Qty tidak boleh 0!",
      });
    }

    if(cartDetail.is_ordered == 1 && cartDetail.qty < qty) {
      return res.status(401).json({
        code: 401,
        message: "Qty item tidak bisa ditambahkan lagi!",
      });
    }

    const cart = await Cart.getByOutletId(outlet_id);
    const oldSubtotalReduce = cart.subtotal - cartDetail.subtotal_price;
    let oldTotalReduce = cart.total - cartDetail.total_price;
    if (cart && cart.discount_id > 0) {
      oldTotalReduce = cart.subtotal - cartDetail.total_price;
    }
    let cartDetailTotalPrice = price * qty;
    const cartDetailSubtotalPrice = cartDetailTotalPrice;

    const updatedCartItems = {
      menu_id,
      menu_detail_id,
      serving_type_id,
      price,
      qty,
      note_item,
      updated_at: indoDateTime,
    };

    if ((cartDetail.is_ordered == 1 && cartDetail.qty == qty) || cartDetail.is_ordered == 0) {
      if (discount_id == 0 || discount_id == null) {
        updatedCartItems.discount_id = 0;
        updatedCartItems.discounted_price = 0;
      } else {
        const discount = await Discount.getById(discount_id);
        const discountedPrice = await applyDiscountAndUpdateTotal(
          price,
          qty,
          discount.is_percent,
          discount.value,
          discount.min_purchase,
          discount.max_discount,
          discount.is_discount_cart,
          null
        );
        cartDetailTotalPrice = discountedPrice;
        const discountedPricePercent = discountedPrice / qty;
        updatedCartItems.discounted_price = Math.max(
          100,
          Math.ceil(discountedPricePercent / 100) * 100
        );
        updatedCartItems.discount_id = discount_id;
      }
      updatedCartItems.subtotal_price = cartDetailSubtotalPrice;
      updatedCartItems.total_price = cartDetailTotalPrice;
      await CartDetail.update(cart_detail_id, updatedCartItems);
    } else {
      // focus for is ordered true
      // create canceled item
      const newQty = cartDetail.qty - qty;
      const newTotalPrice = cartDetail.price * newQty;
      const newCartDetail = {
        cart_id: cart.id,
        menu_id: cartDetail.menu_id,
        menu_detail_id: cartDetail.menu_detail_id,
        serving_type_id: cartDetail.serving_type_id,
        price: cartDetail.price,
        qty: newQty,
        note_item: cartDetail.note_item,
        subtotal_price: newTotalPrice,
        total_price: newTotalPrice,
        is_ordered: 1,
        is_canceled: 1,
        cancel_reason: cancel_reason,
      };

      await CartDetail.create(newCartDetail);

      // update ordered item
      updatedCartItems.discount_id = 0;
      updatedCartItems.discounted_price = 0;
      updatedCartItems.discounted_price = 0;
      updatedCartItems.subtotal_price = cartDetailSubtotalPrice;
      updatedCartItems.total_price = cartDetailTotalPrice;
      await CartDetail.update(cart_detail_id, updatedCartItems);
    }

    const subTotalPrice = oldSubtotalReduce + cartDetailSubtotalPrice;
    const totalPrice = oldTotalReduce + cartDetailTotalPrice;
    const updateSubtotal = {
      subtotal: subTotalPrice,
      total: totalPrice,
      discount_id: 0,
      updated_at: indoDateTime,
    };
    await Cart.update(cart.id, updateSubtotal);

    return res.status(200).json({
      message: "Keranjang berhasil diubah!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage =
      error.message || "Some error occurred while updating the cart";

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
    const {
      outlet_id,
      cancel_reason,
      pin
    } = req.query;
    const oldCartDetail = await CartDetail.getByCartDetailId(cart_detail_id);
    if(oldCartDetail.is_ordered == 1) {
      const outlet = await Outlet.getByOutletId(outlet_id);
      if (outlet.pin != pin) {
        return res.status(401).json({
          code: 401,
          message: "Pin Salah!",
        });
      }
    }
    const cart = await Cart.getByOutletId(outlet_id);
    const subtotalCart = cart.subtotal - oldCartDetail.subtotal_price;
    let totalCart = cart.total - oldCartDetail.total_price;
    if (cart && cart.discount_id > 0) {
      totalCart = cart.subtotal - oldCartDetail.total_price;
    }

    const transaction = await Transaction.getByCartId(cart.id);
    const updateCart = {
      subtotal: subtotalCart,
      total: totalCart,
      discount_id: 0,
      updated_at: indoDateTime,
    };

    if ((!transaction || transaction.length == 0) && totalCart == 0) {
      updateCart.is_active = false;
      updateCart.is_queuing = true;
    }

    if (transaction && totalCart == 0) {
      updateCart.is_canceled = true;
      updateCart.is_active = false;
    }

    const updateCartDetail = {
      updated_at: indoDateTime,
    };

    if (oldCartDetail.is_ordered == 1) {
      updateCartDetail.is_canceled = 1;
      updateCartDetail.cancel_reason = cancel_reason;
    } else {
      updateCartDetail.deleted_at = indoDateTime;
    }

    await Cart.update(cart.id, updateCart);
    await CartDetail.update(oldCartDetail.cart_detail_id,
      updateCartDetail,
    );

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
    const {
      outlet_id,
      cart_id,
      pin,
      cancel_reason
    } = req.body;
    const outlet = await Outlet.getByOutletId(outlet_id);
    if (outlet.pin != pin) {
      return res.status(401).json({
        code: 401,
        message: "Pin Salah!",
      });
    } else {
      const transaction = await Transaction.getByCartId(cart_id);
      if (transaction) {
        await Transaction.update(transaction.id, {
          updated_at: indoDateTime
        })

        await Cart.update(cart_id, {
          is_canceled: 1,
          is_active: false,
          is_queuing: false,
          updated_at: indoDateTime,
        });

        await CartDetail.updateAllByCartId(cart_id, {
          is_canceled: 1,
          cancel_reason: cancel_reason,
          updated_at: indoDateTime,
        });
      } else {
        const cart = await Cart.getByCartId(cart_id);
        const deleteCost = {
          subtotal: 0,
          total: 0,
          discount_id: null,
          updated_at: indoDateTime,
        };
        if (cart && cart.cart_id_main_split != null) {
          const oldTransaction = await Transaction.getByCartId(cart.cart_id_main_split);
          if (oldTransaction) {
            await Cart.update(cart_id, {
              is_canceled: 1,
              is_active: false,
              is_queuing: false,
              updated_at: indoDateTime,
            });
    
            await CartDetail.updateAllByCartId(cart_id, {
              is_canceled: 1,
              cancel_reason: cancel_reason,
              updated_at: indoDateTime,
            });
          } else {
            deleteCost.is_active = false;
            deleteCost.is_queuing = false;

            await CartDetail.updateAllByCartId(cart_id, {
              updated_at: indoDateTime,
              deleted_at: indoDateTime,
            });
  
            await Cart.update(cart_id, deleteCost);
          }
        } else {
          await CartDetail.updateAllByCartId(cart_id, {
            updated_at: indoDateTime,
            deleted_at: indoDateTime,
          });

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
  const {
    outlet_id,
    cart_id,
    cart_details
  } = req.body;
  try {
    const newCart = await Cart.create({
      outlet_id: outlet_id,
      cart_id_main_split: cart_id
    });
    const newCartID = newCart.insertId;
    let subtotalNewCart = 0;
    for (const cartDetail of cart_details) {
      const oldCartDetail = await CartDetail.getByCartDetailId(
        cartDetail.cart_detail_id
      );
      const oldTotalPriceItem =
        oldCartDetail.price * (oldCartDetail.qty - cartDetail.qty_to_split);
      const newTotalPriceItem = oldCartDetail.price * cartDetail.qty_to_split;

      const newCartDetail = {
        cart_id: newCartID,
        menu_id: oldCartDetail.menu_id,
        serving_type_id: oldCartDetail.serving_type_id,
        qty: cartDetail.qty_to_split,
        price: oldCartDetail.price,
        total_price: newTotalPriceItem,
      };

      if (oldCartDetail.menu_detail_id != null) {
        newCartDetail.menu_detail_id = oldCartDetail.menu_detail_id;
      }

      if (oldCartDetail.note_item) {
        newCartDetail.note_item = oldCartDetail.note_item;
      }

      await CartDetail.create(newCartDetail);

      await CartDetail.update(cartDetail.cart_detail_id, {
        discount_id: 0,
        discounted_price: null,
        qty: oldCartDetail.qty - cartDetail.qty_to_split,
        total_price: oldTotalPriceItem,
      });

      subtotalNewCart = subtotalNewCart + newTotalPriceItem;
    }

    const oldCartDetails = await CartDetail.getByCartId(cart_id, false);
    if (oldCartDetails) {
      let subtotalCart = 0;
      for (const oldCartDetail of oldCartDetails) {
        let subtotalCartDetail = oldCartDetail.qty * oldCartDetail.price;
        if (oldCartDetail.discount_id) {
          subtotalCartDetail = oldCartDetail.total_price;
        }
        if (oldCartDetail.qty == 0) {
          await CartDetail.update(oldCartDetail.cart_detail_id, {
            deleted_at: indoDateTime,
          });
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
      });
    }

    await Cart.update(newCartID, {
      subtotal: subtotalNewCart,
      total: subtotalNewCart,
      updated_at: indoDateTime,
      is_active: 1,
      is_queuing: 0,
    });

    return res.status(201).json({
      message: "Cart berhasil dipisah!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage =
      error.message || "Some error occurred while separate the cart";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
};

exports.getStatusOrderedCart = async (req, res) => {
  try {
    let cart = await Cart.getByOutletId(req.query.outlet_id);
    let result = {
      is_ordered: 0,
    };
    if (cart) {
      const cartDetails = await CartDetail.getOrderedByCartId(cart.id);
      if(cartDetails.length > 0) {
        result.is_ordered = 1;
      }
    } else {
      return res.status(200).json({
        message: "Keranjang di Outlet ini sedang kosong",
        data: result
      });
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

exports.emptyCart = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const {
      cart_id,
    } = req.query;
    const cart = await Cart.getByCartId(cart_id);
    const deleteCost = {
      subtotal: 0,
      total: 0,
      discount_id: null,
      updated_at: indoDateTime,
    };

    if (cart && cart.cart_id_main_split != null) {
      const oldCart = await Cart.getOldCartBySplitCartId(cart.cart_id_main_split);
      if (oldCart) {
        await Cart.update(cart_id, {
          is_active: false,
          is_queuing: true,
        });

        await Cart.update(oldCart.id, {
          is_active: true,
          is_queuing: false
        })

      } 
    }

    await CartDetail.updateAllByCartId(cart_id, {
      deleted_at: indoDateTime,
    });

    await Cart.update(cart_id, deleteCost);

    return res.status(200).json({
      code: 200,
      message: "Berhasil menghapus data keranjang",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting cart",
    });
  }
};