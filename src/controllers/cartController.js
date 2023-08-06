const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const thisTimeNow = new Date();
const CartTopping = require("../models/cart_topping");
// const Discount = require("../models/discount");
const deletedAtNow = {
  deleted_at: new Date(),
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getByOutletId(req.query.outlet_id);
    if (!cart) {
      return res.status(200).json({
        message: "Keranjang di Outlet ini sedang kosong",
      });
    }

    // let discounts;
    const cartDetails = await CartDetail.getByCartId(cart.id);

    for (const cartDetail of cartDetails) {
      // if(cartDetail.discount_id !== null ) {
      // if(discounts === undefined) {
      //     discounts = await Discount.getAll();
      // }
      // }
      delete cartDetail.discount_id;

      // if(cartDetail.menu_detail_id == null) {
      //     delete cartDetail.menu_detail_id;
      //     delete cartDetail.varian;
      //     delete cartDetail.menu_detail_price;
      // }

      if (cartDetail.note_item == null) {
        delete cartDetail.note_item;
      }

      const toppings = await CartTopping.getByCartDetailId(cartDetail.cart_detail_id);
      if (toppings.length > 0) {
        cartDetail.toppings = toppings;
      }
    }

    const result = {
      cart_id: cart.id,
      subtotal: cart.subtotal,
      total: cart.total,
      cartDetails: cartDetails,
    };

    // if(cart.discount_id !== null) {
    //     if(discounts === undefined) {
    //         discounts = await Discount.getAll();
    //     }
    //     discounts = await Discount.getAll();
    //     const discount = discounts.find(type => type.id == cart.discount_id);
    //     result.discount_id = cart.discount_id;
    //     result.discount_code = discount.code;
    // }

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
  const { outlet_id, discount_id, cart_details } = req.body;
  try {
    const cart = await Cart.getByOutletId(outlet_id);
    let cartId,
      subTotalPrice = 0;
    if (cart) {
      cartId = cart.id;
      subTotalPrice = cart.subtotal;
    } else {
      let newCart = {};
      newCart.outlet_id = outlet_id;
      if (discount_id) {
        newCart.discount_id = discount_id;
      }
      const createdCart = await Cart.create(newCart);
      cartId = createdCart.insertId;
    }

    for (const cartDetail of cart_details) {
      let cartDetailTotalPrice = cartDetail.price * cartDetail.qty;
      const newCartDetail = {
        cart_id: cartId,
        menu_id: cartDetail.menu_id,
        serving_type_id: cartDetail.serving_type_id,
        price: cartDetail.price,
        qty: cartDetail.qty,
        total_price: cartDetailTotalPrice,
      };

      if (cartDetail.discount_id) {
        newCartDetail.discount_id = cartDetail.discount_id;
      }

      if (cartDetail.menu_detail_id) {
        newCartDetail.menu_detail_id = cartDetail.menu_detail_id;
      }

      if (cartDetail.note_item) {
        newCartDetail.note_item = cartDetail.note_item;
      }

      const createdCartDetail = await CartDetail.create(newCartDetail);

      if (cartDetail.toppings) {
        let toppingsTotalPrice = 0;
        for (const topping of cartDetail.toppings) {
          const toppingTotalPrice = topping.price * topping.qty;
          toppingsTotalPrice = toppingsTotalPrice + toppingTotalPrice;
          const newTopping = {
            cart_detail_id: createdCartDetail.insertId,
            menu_detail_id: topping.menu_detail_id,
            serving_type_id: cartDetail.serving_type_id,
            price: topping.price,
            qty: topping.qty,
            total_price: toppingTotalPrice,
          };
          await CartTopping.create(newTopping);
        }
        cartDetailTotalPrice = cartDetailTotalPrice + toppingsTotalPrice * cartDetail.qty;
        await CartDetail.update(createdCartDetail.insertId, {
          total_price: cartDetailTotalPrice,
        });
      }
      subTotalPrice = subTotalPrice + cartDetailTotalPrice;
    }

    await Cart.update(cartId, {
      subtotal: subTotalPrice,
      total: subTotalPrice,
    });

    return res.status(201).json({
      message: "Cart berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the cart",
    });
  }
};

exports.updateCart = async (req, res) => {
  try {
    // const  { outlet_id } = req.query;
    const { cart_id, cart_details } = req.body;

    const oldCartDetails = await CartDetail.getByCartId(cart_id);
    const oldCartDetailIds = oldCartDetails.map((item) => item.cart_detail_id);
    const cartDetailIds = cart_details.filter((item) => item.cart_detail_id !== undefined).map((item) => item.cart_detail_id);
    const cartDetailIdsToDelete = oldCartDetailIds.filter((id) => !cartDetailIds.includes(id));
    const invalidCartDetailIds = cartDetailIds.filter((id) => !oldCartDetailIds.includes(id));
    if (invalidCartDetailIds.length > 0) {
      return res.status(400).json({
        message: "Terdapat menu yang tidak terdaftar pada cart!",
      });
    }

    for (const cartDetail of cart_details) {
      const updatedCartDetail = {
        menu_id: cartDetail.menu_id,
        serving_type_id: cartDetail.serving_type_id,
        price: cartDetail.price,
        qty: cartDetail.qty,
        note_item: cartDetail.note_item,
        updated_at: thisTimeNow,
      };

      if(cartDetail.menu_detail_id) {
        updatedCartDetail.menu_detail_id = cartDetail.menu_detail_id;
      }

      if(cartDetail.discount_id) {
        updatedCartDetail.discount_id = cartDetail.discount_id;
      }

      if (cartDetail.cart_detail_id == undefined) {
        updatedCartDetail.cart_id = cart_id;
        const createdCartDetail = await CartDetail.create(updatedCartDetail);
        if (cartDetail.toppings) {
          for (const topping of cartDetail.toppings) {
            const newTopping = {
              cart_detail_id: createdCartDetail.insertId,
              menu_detail_id: topping.menu_detail_id,
              serving_type_id: cartDetail.serving_type_id,
              price: topping.price,
              qty: topping.qty,
            };
            await CartTopping.create(newTopping);
          }
        }
      } 

      if(cartDetail.cart_detail_id) {
        await CartDetail.update(cartDetail.cart_detail_id, updatedCartDetail);
      }

      if (cartDetail.cart_detail_id && cartDetail.toppings) {
        const oldToppings = await CartTopping.getByCartDetailId(cartDetail.cart_detail_id);
        const oldToppingIds = oldToppings.map((item) => item.cart_topping_id);
        const toppingIds = cartDetail.toppings.filter((item) => item.cart_topping_id !== undefined).map((item) => item.cart_topping_id);
        const toppingIdsToDelete = oldToppingIds.filter((id) => !toppingIds.includes(id));
        const invalidToppingIds = toppingIds.filter((id) => !oldToppingIds.includes(id));
        if (invalidToppingIds.length > 0) {
          return res.status(400).json({
            message: "Terdapat topping yang tidak terdaftar pada menu!",
          });
        }

        for (const topping of cartDetail.toppings) {
          const updatedTopping = {
            menu_detail_id: topping.menu_detail_id,
            qty: topping.qty,
            price: topping.price,
          };

          if (topping.cart_topping_id == undefined) {
            updatedTopping.menu_detail_id = topping.menu_detail_id,
            updatedTopping.cart_detail_id = cartDetail.cart_detail_id;
            updatedTopping.serving_type_id = cartDetail.serving_type_id;
            await CartTopping.create(updatedTopping);
          }

          if (topping.cart_topping_id) {
            updatedTopping.updated_at = thisTimeNow;
            await CartTopping.update(topping.cart_topping_id, updatedTopping);
          }
        }

        if (toppingIdsToDelete.length > 0) {
          for (const toppingIdToDelete of toppingIdsToDelete) {
            await CartTopping.delete(toppingIdToDelete, deletedAtNow);
          }
        }
      }
    }

    if (cartDetailIdsToDelete.length > 0) {
      for (const cartDetailIdToDelete of cartDetailIdsToDelete) {
        await CartDetail.delete(cartDetailIdToDelete, deletedAtNow);
      }
    }

    await Cart.update(cart_id, {
      updated_at: thisTimeNow,
    });

    return res.status(201).json({
      message: "Data cart berhasil diubah!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while updating the cart",
    });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const {cartId} = req.body;

    const cartDetails = await CartDetail.getByCartId(cartId);

    for (const cartDetail of cartDetails) {
      await CartDetail.delete(cartDetail.cart_id, deletedAtNow);
      await CartTopping.delete(cartDetail.cart_detail_id, deletedAtNow);
    }

    await Cart.delete(cartId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data cart",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting cart",
    });
  }
};
