const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");

exports.getCarts = async (req, res) => {
    try {
        const carts = await Cart.getByOutletId(req.query.outlet_id);

        const filteredCarts = carts.map((cart) => {
        const filteredCart = {};

        for (const key in cart) {
            if (cart[key] !== null && cart[key] !== "" && cart[key] !== "0.00" && cart[key] !== 0) {
            filteredCart[key] = cart[key];
            }
        }
            return filteredCart;
        });

        return res.status(200).json({
            data: filteredCarts,
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
        if(cart) {
            const cartDetails = CartDetail.getByCartId(cart.id);
        } else {
            let newCart = {}
            newCart.outlet_id = outlet_id;
            if(discount_id) {
                newCart.discount_id = discount_id;
            }
            const createdCart = await Cart.create(newCart);

            for(const menuDetail of cart_details) {
                let newCartDetail
            }
        }
    } catch (error) {
        return res.status(500).json({
        message: error.message || "Some error occurred while creating the cart",
        });
    }
}