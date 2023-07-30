const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const CartTopping = require("../models/cart_topping");
// const Discount = require("../models/discount");

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.getByOutletId(req.query.outlet_id);
        if(!cart) {
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

            if(cartDetail.note_item == null) {
                delete cartDetail.note_item;
            }

            const toppings = await CartTopping.getByCartDetailId(cartDetail.cart_detail_id);
            if(toppings.length > 0) {
                cartDetail.toppings = toppings;
            }
        }

        const result = {
            subtotal : cart.subtotal,
            total : cart.total,
            cartDetails : cartDetails,
        }

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
        let cartId, subTotalPrice = 0;
        if(cart) {
            cartId = cart.id;
            subTotalPrice = cart.subtotal;
        } else {
            let newCart = {};
            newCart.outlet_id = outlet_id;
            if(discount_id) {
                newCart.discount_id = discount_id;
            }
            const createdCart = await Cart.create(newCart);
            cartId = createdCart.insertId;
        }
 
        for(const cartDetail of cart_details) {
            let cartDetailTotalPrice = cartDetail.price * cartDetail.qty;
            const newCartDetail = {
                cart_id: cartId,
                menu_id: cartDetail.menu_id,
                serving_type_id: cartDetail.serving_type_id,
                price: cartDetail.price,
                qty: cartDetail.qty,
                total_price: cartDetailTotalPrice,
            }

            if(cartDetail.discount_id) {
                newCartDetail.discount_id = cartDetail.discount_id;
            }

            if(cartDetail.menu_detail_id) {
                newCartDetail.menu_detail_id = cartDetail.menu_detail_id;
            }

            if(cartDetail.note_item) {
                newCartDetail.note_item = cartDetail.note_item;
            }

            const createdCartDetail = await CartDetail.create(newCartDetail);

            if(cartDetail.toppings) {
                let toppingsTotalPrice = 0;
                for(const topping of cartDetail.toppings) {
                    const toppingTotalPrice = topping.price * topping.qty;
                    toppingsTotalPrice = toppingsTotalPrice + toppingTotalPrice;
                    const newTopping = {
                        cart_detail_id: createdCartDetail.insertId,
                        menu_detail_id: topping.menu_detail_id,
                        serving_type_id: cartDetail.serving_type_id,
                        price: topping.price,
                        qty: topping.qty,
                        total_price: toppingTotalPrice,
                    }
                    await CartTopping.create(newTopping);
                }
                cartDetailTotalPrice = cartDetailTotalPrice + (toppingsTotalPrice * cartDetail.qty); 
                await CartDetail.update(createdCartDetail.insertId, {
                    total_price : cartDetailTotalPrice,
                })
            }
            subTotalPrice = subTotalPrice + cartDetailTotalPrice;
        }

        await Cart.update(cartId, {
            subtotal : subTotalPrice,
            total : subTotalPrice,
        })

        return res.status(201).json({
            message: "Cart berhasil ditambahkan!",
        });
    } catch (error) {
        return res.status(500).json({
        message: error.message || "Some error occurred while creating the cart",
        });
    }
}