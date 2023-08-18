const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const Discount = require("../models/discount");
const Transaction = require("../models/transaction");
const { applyDiscountAndUpdateTotal } = require("../utils/generalFunctions");
const thisTimeNow = new Date();
const deletedAtNow = {
  deleted_at: thisTimeNow,
};

exports.getTransactions = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const transactions = await Transaction.getAllByOutletID(outlet_id);

    const filteredTransactions = transactions.map((transaction) => {
      const filteredTransaction = {};

      for (const key in transaction) {
        if (transaction[key] !== null && transaction[key] !== "" && transaction[key] !== "0.00" && transaction[key] !== 0) {
          filteredTransaction[key] = transaction[key];
        }
      }

      return filteredTransaction;
    });

    return res.status(200).json({
      data: filteredTransactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch transactions",
    });
  }
};

exports.createTransaction = async (req, res) => {
  const { 
    outlet_id,
    cart_id,
    customer_seat, 
    customer_name, 
    transaction_id, 
    customer_cash,
    payment_type,
    delivery_type,
    delivery_note
  } = req.body;

  const transaction = {};

  if(customer_name) {
    transaction.customer_name = customer_name;
  }

  if(customer_seat) {
    transaction.customer_seat = customer_seat;
  }

  if (delivery_type) {
    transaction.delivery_type = delivery_type;
    transaction.delivery_note = delivery_note;
  }

  try {
    const cart = await Cart.getByCartId(cart_id);

    if (customer_cash) {
      transaction.customer_cash = customer_cash;
      transaction.customer_change = customer_cash - cart.total; 
      transaction.payment_type = payment_type;
      transaction.invoice_number = "INV-" + generateTimeNow() + "-" + payment_type;
      transaction.invoice_due_date = thisTimeNow;
    }

    if (!transaction_id) {
      transaction.receipt_number = "AT-" + customer_name + "-" + customer_seat + "-" + generateTimeNow();
      transaction.outlet_id= outlet_id;
      transaction.cart_id= cart_id;
      await Transaction.create(transaction);
    } else {
      await Transaction.update(transaction_id, transaction);
    }
    
    await Cart.update(cart_id, {
      is_active: false
    })

    return res.status(201).json({
      message: "Transaksi Sukses!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the transaction",
    });
  }
};

// exports.updateTransaction = async (req, res) => {
//   try {
//     const transactionId = req.params.id;
//     const { customer_name, subtotal, total, transaction_details } = req.body;
//     customer_seat = req.body.customer_seat || 0;
//     const updateTransaction = {
//       customer_name: customer_name,
//       customer_seat: customer_seat,
//       subtotal: subtotal,
//       total: total,
//       updated_at: thisTimeNow,
//       receipt_number: "AT-" + customer_name + "-" + customer_seat + "-" + generateTimeNow(),
//     };
//     await Transaction.update(transactionId, updateTransaction);

//     const oldTransactionDetails = await TransactionDetail.getAllByTransactionID(transactionId);
//     const oldTransactionDetailIds = oldTransactionDetails.map((item) => item.transaction_detail_id);
//     const transactionDetailIds = transaction_details.filter((item) => item.transaction_detail_id !== undefined).map((item) => item.transaction_detail_id);
//     const transactionDetailIdsToDelete = oldTransactionDetailIds.filter((id) => !transactionDetailIds.includes(id));
//     const invalidTransactionDetailIds = transactionDetailIds.filter((id) => !oldTransactionDetailIds.includes(id));
//     if (invalidTransactionDetailIds.length > 0) {
//       return res.status(400).json({
//         message: "Terdapat item menu yang tidak terdaftar pada transaksi sebelumnya!",
//       });
//     }

//     for (const transactionDetail of transaction_details) {
//       const updatedTransactionDetail = {
//         menu_id: transactionDetail.menu_id,
//         serving_type_id: transactionDetail.serving_type_id,
//         total_item: transactionDetail.total_item,
//         updated_at: thisTimeNow,
//       };

//       if (transactionDetail.note_item) {
//         updatedTransactionDetail.note_item = transactionDetail.note_item;
//       }

//       if (transactionDetail.menu_detail_id) {
//         updatedTransactionDetail.menu_detail_id = transactionDetail.menu_detail_id;
//       }

//       await TransactionDetail.update(transactionDetail.transaction_detail_id, updatedTransactionDetail);

//       if (transactionDetail.transaction_detail_id == undefined) {
//         updatedTransactionDetail.transaction_id = transactionId;
//         const createdTransactionDetail = await TransactionDetail.create(updatedTransactionDetail);
//         if (transactionDetail.toppings) {
//           for (const topping of transactionDetail.toppings) {
//             const newTopping = {
//               transaction_detail_id: createdTransactionDetail.insertId,
//               menu_detail_id: topping.menu_detail_id,
//               serving_type_id: transactionDetail.serving_type_id,
//               total_item: topping.total_item,
//             };
//             await TransactionTopping.create(newTopping);
//           }
//         }
//       }

//       if (transactionDetail.toppings && transactionDetail.transaction_detail_id) {
//         const oldToppings = await TransactionTopping.getAllByTransactionDetailID(transactionDetail.transaction_detail_id);
//         const oldToppingIds = oldToppings.map((item) => item.transaction_topping_id);
//         const toppingIds = transactionDetail.toppings.filter((item) => item.transaction_topping_id !== undefined).map((item) => item.transaction_topping_id);
//         const toppingIdsToDelete = oldToppingIds.filter((id) => !toppingIds.includes(id));
//         const invalidToppingIds = toppingIds.filter((id) => !oldToppingIds.includes(id));
//         if (invalidToppingIds.length > 0) {
//           return res.status(400).json({
//             message: "Terdapat topping yang tidak terdaftar pada transaksi sebelumnya!",
//           });
//         }

//         for (const topping of transactionDetail.toppings) {
//           const updatedTopping = {
//             menu_detail_id: topping.menu_detail_id,
//             total_item: topping.total_item,
//             updated_at: thisTimeNow,
//           };

//           await TransactionTopping.update(topping.transaction_topping_id, updatedTopping);

//           if (topping.transaction_topping_id == undefined) {
//             updatedTopping.transaction_detail_id = transactionDetail.transaction_detail_id;
//             updatedTopping.serving_type_id = transactionDetail.serving_type_id;
//             await TransactionTopping.create(updatedTopping);
//           }
//         }

//         if (toppingIdsToDelete.length > 0) {
//           for (const toppingIdToDelete of toppingIdsToDelete) {
//             await TransactionTopping.delete(toppingIdToDelete, deletedAtNow);
//           }
//         }
//       }
//     }

//     if (transactionDetailIdsToDelete.length > 0) {
//       for (const transactionDetailIdToDelete of transactionDetailIdsToDelete) {
//         await TransactionDetail.delete(transactionDetailIdToDelete, deletedAtNow);
//       }
//     }

//     return res.status(201).json({
//       message: "Data transaksi berhasil diubah!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Some error occurred while updating the transaction",
//     });
//   }
// };

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  // const { outlet_id } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    const cart = await Cart.getByCartId(transaction.cart_id);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id);

    const result = {
      transaction_id: transaction.id,
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      cart_id: transaction.cart_id,
      subtotal: cart.subtotal,
      total: cart.total,
      discount_id: cart.discount_id,
      discount_code: cart.discount_code,
      discounts_value: cart.discounts_value,
      discounts_is_percent: cart.discounts_is_percent,
      cartDetails: cartDetails
    };

    // Activate cart
    await Cart.update(transaction.cart_id, {
      is_active : true,
    })

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while get the transaction",
    });
  }
};

// exports.deleteTransaction = async (req, res) => {
//   try {
//     const transactionId = req.params.id;

//     await Transaction.delete(transactionId, deletedAtNow);

//     return res.status(200).json({
//       message: "Berhasil menghapus data transaksi",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Error while deleting menu",
//     });
//   }
// };

function generateTimeNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const thisTime = `${year}${month}${day}-${hours}${minutes}${seconds}`;

  return thisTime;
}

exports.createDiscountTransaction = async (req, res) => {
  const { 
    cart_id,
    discount_id
  } = req.body;
  try {
    const cart = await Cart.getByCartId(cart_id);
    const discount = await Discount.getById(discount_id);
    totalCartPrice = await applyDiscountAndUpdateTotal(cart.subtotal, discount.min_purchase, discount.is_percent, discount.value)
    await Cart.update(cart_id, {
      discount_id: discount_id,
      total: totalCartPrice,
    })
    return res.status(201).json({
      message: "Diskon berhasil ditambahkan!",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || "Some error occurred while creating the discount for transaction";

    return res.status(statusCode).json({
      message: errorMessage,
    });
  }
}
