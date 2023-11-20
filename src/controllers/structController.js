const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Transaction = require("../models/transaction");
const Refund = require("../models/refund");
const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");
const RefundDetail = require("../models/refund_detail");
const ServingType = require("../models/serving_type");
const Outlet = require("../models/outlet");

exports.getCustomerStruct = async (req, res) => {
  const { id } = req.params;
  // const { outlet_id } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(transaction.outlet_id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);
    const refund = await Refund.getByTransactionId(id);
    let refundDetails = [];
    if (refund) {
      refundDetails = await RefundDetail.getByRefundId(refund.id);
    }
    const cartDetailsWithoutId = cartDetails.map((detail) => {
      const { cart_detail_id, menu_id, menu_detail_id, discount_id, serving_type_id, ...detailWithoutId } = detail;
      return detailWithoutId;
    });

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      date_time: transaction.invoice_due_date.toGMTString(),
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cart_details: cartDetailsWithoutId,
    };

    if (refund) {
      const refundDetailsWithoutId = refundDetails.map((detail) => {
        const { id, cart_detail_id, ...detailWithoutId } = detail;
        return detailWithoutId;
      });
      result.is_refund_all = refund.is_refund_all;
      result.refund_reason = refund.refund_reason;
      result.refund_details = refundDetailsWithoutId;
    }

    return res.status(200).json({
      code: 200,
      message: "Cart berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

exports.getKitchenStruct = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(transaction.outlet_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);

    let updatedCartDetails = [];

    for (const cartDetail of cartDetails) {
      const menus = await Menu.getById(cartDetail.menu_id);
      const menuDetail = await MenuDetail.getAllByMenuID(menus.id);
      const servingType = await ServingType.getServingTypeById(cartDetail.serving_type_id);
      const data = {
        menu_name: menus.name,
        menu_type: menus.menu_type,
        varian: menuDetail.varian,
        serving_type_name: servingType.name,
        qty: cartDetail.qty,
        note_item: cartDetail.note_item,
      };
      updatedCartDetails.push(data);
    }

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      date_time: transaction.invoice_due_date.toGMTString(),
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      delivery_type: transaction.delivery_type,
      delivery_note: transaction.delivery_note,
      cart_details: updatedCartDetails,
    };

    if (transaction.delivery_type == null && transaction.delivery_note == null) {
      result.delivery_type = "null";
      result.delivery_note = "null";
    }

    return res.status(200).json({
      code: 200,
      message: "Cart Kitchen berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

exports.getShiftStruct = async (req, res) => {
  const { start_time, end_time, outlet_id } = req.body;
  try {
    const transaction = await Transaction.getById(id);
    const outlet = await Outlet.getByOutletId(outlet_id);

    const result = {
      outlet_name: outlet.name,
      outlet_address: outlet.address,
      date_time: transaction.invoice_due_date.toGMTString(),
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      delivery_type: transaction.delivery_type,
      delivery_note: transaction.delivery_note,
      cart_details: updatedCartDetails,
    };

    return res.status(200).json({
      code: 200,
      message: "Struk shift berhasil ditampilkan!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};
