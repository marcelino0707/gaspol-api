const InstallmentCart = require("../models/installment_cart");
const Cart = require("../models/cart");
const { formatDate } = require("../utils/generalFunctions");

exports.getInstallmentCart = async (req, res) => {
  try {
    const installmentCarts = await InstallmentCart.getAll();

    return res.status(200).json({
      code: 200,
      message: "Success to get installment carts",
      data: installmentCarts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get installment carts",
    });
  }
};

exports.getInstallmentCartByCartId = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.getNotYetPaidByCartId(id);
    if(!cart || cart == 0) {
        return res.status(200).json({
            code: 200,
            message: "Sudah Lunas!",
        });
    }
    let paid = 0;
    const installmentCarts = await InstallmentCart.getByCartId(id);
    if (installmentCarts && installmentCarts.length > 0) {
        paid = installmentCarts.reduce((totalPaid, item) => {
            return totalPaid + item.total;
        }, 0);

        installmentCarts.forEach(item => {
            item.created_at = formatDate(item.created_at);
        });
    }
    let unpaid = cart.total - paid;

    const result = {
        total_cart : cart.total,
        unpaid_balance : unpaid,
        paid_balance: paid,
        detail_paid: installmentCarts,
    };
  
    return res.status(200).json({
        code: 200,
        message: "Success to get installment carts",
        data: result,
    });
  } catch (error) {
    return res.status(500).json({
        message: error.message || "Error to get installment cart from card id = " + id,
      });
  }
};

exports.createInstallmentCart = async (req, res) => {
  try {
    const { cart_id, cash } = req.body;

    await InstallmentCart.create({
        cart_id: cart_id,
        total : cash,
    });

    const cart = await Cart.getByCartId(cart_id);
    let paid = 0;
    const installmentCarts = await InstallmentCart.getByCartId(cart_id);
    if (installmentCarts && installmentCarts.length > 0) {
        paid = installmentCarts.reduce((totalPaid, item) => {
            return totalPaid + item.total;
        }, 0);
    };

    if(paid == cart.total) {
        await Cart.update(cart_id, {
            is_paided : true,
        })

        return res.status(200).json({
            code: 201,
            message: "Cicilan Lunas!",
        });
    }

    return res.status(200).json({
      code: 201,
      message: "Cicilan berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Cicilan gagal ditambahkan!",
    });
  }
};
