// const Menu = require("../models/menu");
// const MenuDetail = require("../models/menu_detail");
const Cart = require("../models/cart");
const CartDetail = require("../models/cart_detail");
const ServingType = require("../models/serving_type");
const Transaction = require("../models/transaction");
const TransactionDetail = require("../models/transaction_detail");
const TransactionTopping = require("../models/transaction_topping");
const { priceDeterminant } = require("../utils/generalFunctions");
const deletedAtNow = {
  deleted_at: new Date(),
};
const thisTimeNow = new Date();

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();

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
  try {
    let transaction = {};
    if (!req.body.transaction_id) {
      const customer_seat = req.body.customer_seat || 0;
      transaction = {
        customer_name: req.body.customer_name,
        customer_seat: customer_seat,
        subtotal: req.body.total_cart,
        total: req.body.total_cart,
        receipt_number: "AT-" + req.body.customer_name + "-" + customer_seat + "-" + generateTimeNow(),
      };
    }

    if (req.body.customer_cash) {
      (transaction.customer_cash = req.body.customer_cash),
        (transaction.customer_change = req.body.customer_change),
        (transaction.payment_type = req.body.payment_type),
        (transaction.invoice_number = "INV-" + generateTimeNow() + "-" + req.body.payment_type),
        (transaction.invoice_due_date = new Date());
    }

    if (req.body.discount_id) {
      transaction.discount_id = req.body.discount_id;
    }

    if (req.body.delivery_type) {
      (transaction.delivery_type = req.body.delivery_type), (transaction.delivery_note = req.body.delivery_note);
    }

    // let createdTransaction;
    if (!req.body.transaction_id) {
      // createdTransaction = await Transaction.create(transaction);
      transaction.outlet_id= req.body.outlet_id;
      transaction.cart_id= req.body.cart_id;
      await Transaction.create(transaction);
      await Cart.update(req.body.cart_id, {
        is_active: true
      })
    } else {
      // createdTransaction = await Transaction.update(req.body.transaction_id, transaction);
      await Transaction.update(req.body.transaction_id, transaction);
    }

    // if (req.body.transaction_details) {
    //   const transactionDetails = req.body.transaction_details;
    //   for (const transactionDetail of transactionDetails) {
    //     let newTransactionDetail = {};
    //     newTransactionDetail.transaction_id = createdTransaction.insertId;
    //     newTransactionDetail.menu_id = transactionDetail.menu_id;
    //     newTransactionDetail.serving_type_id = transactionDetail.serving_type_id;
    //     newTransactionDetail.total_item = transactionDetail.total_item;
    //     newTransactionDetail.note_item = transactionDetail.note_item;

    //     if (transactionDetail.menu_detail_id) {
    //       newTransactionDetail.menu_detail_id = transactionDetail.menu_detail_id;
    //     }

    //     const createdTransactionDetail = await TransactionDetail.create(newTransactionDetail);

    //     if (transactionDetail.toppings) {
    //       const toppings = transactionDetail.toppings;
    //       for (const topping of toppings) {
    //         const newTopping = {
    //           transaction_detail_id: createdTransactionDetail.insertId,
    //           menu_detail_id: topping.menu_detail_id,
    //           serving_type_id: transactionDetail.serving_type_id,
    //           total_item: topping.total_item,
    //         };

    //         await TransactionTopping.create(newTopping);
    //       }
    //     }
    //   }
    // }

    return res.status(201).json({
      message: "Transaksi Sukses!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the transaction",
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { customer_name, subtotal, total, transaction_details } = req.body;
    customer_seat = req.body.customer_seat || 0;
    const updateTransaction = {
      customer_name: customer_name,
      customer_seat: customer_seat,
      subtotal: subtotal,
      total: total,
      updated_at: thisTimeNow,
      receipt_number: "AT-" + customer_name + "-" + customer_seat + "-" + generateTimeNow(),
    };
    await Transaction.update(transactionId, updateTransaction);

    const oldTransactionDetails = await TransactionDetail.getAllByTransactionID(transactionId);
    const oldTransactionDetailIds = oldTransactionDetails.map((item) => item.transaction_detail_id);
    const transactionDetailIds = transaction_details.filter((item) => item.transaction_detail_id !== undefined).map((item) => item.transaction_detail_id);
    const transactionDetailIdsToDelete = oldTransactionDetailIds.filter((id) => !transactionDetailIds.includes(id));
    const invalidTransactionDetailIds = transactionDetailIds.filter((id) => !oldTransactionDetailIds.includes(id));
    if (invalidTransactionDetailIds.length > 0) {
      return res.status(400).json({
        message: "Terdapat item menu yang tidak terdaftar pada transaksi sebelumnya!",
      });
    }

    for (const transactionDetail of transaction_details) {
      const updatedTransactionDetail = {
        menu_id: transactionDetail.menu_id,
        serving_type_id: transactionDetail.serving_type_id,
        total_item: transactionDetail.total_item,
        updated_at: thisTimeNow,
      };

      if (transactionDetail.note_item) {
        updatedTransactionDetail.note_item = transactionDetail.note_item;
      }

      if (transactionDetail.menu_detail_id) {
        updatedTransactionDetail.menu_detail_id = transactionDetail.menu_detail_id;
      }

      await TransactionDetail.update(transactionDetail.transaction_detail_id, updatedTransactionDetail);

      if (transactionDetail.transaction_detail_id == undefined) {
        updatedTransactionDetail.transaction_id = transactionId;
        const createdTransactionDetail = await TransactionDetail.create(updatedTransactionDetail);
        if (transactionDetail.toppings) {
          for (const topping of transactionDetail.toppings) {
            const newTopping = {
              transaction_detail_id: createdTransactionDetail.insertId,
              menu_detail_id: topping.menu_detail_id,
              serving_type_id: transactionDetail.serving_type_id,
              total_item: topping.total_item,
            };
            await TransactionTopping.create(newTopping);
          }
        }
      }

      if (transactionDetail.toppings && transactionDetail.transaction_detail_id) {
        const oldToppings = await TransactionTopping.getAllByTransactionDetailID(transactionDetail.transaction_detail_id);
        const oldToppingIds = oldToppings.map((item) => item.transaction_topping_id);
        const toppingIds = transactionDetail.toppings.filter((item) => item.transaction_topping_id !== undefined).map((item) => item.transaction_topping_id);
        const toppingIdsToDelete = oldToppingIds.filter((id) => !toppingIds.includes(id));
        const invalidToppingIds = toppingIds.filter((id) => !oldToppingIds.includes(id));
        if (invalidToppingIds.length > 0) {
          return res.status(400).json({
            message: "Terdapat topping yang tidak terdaftar pada transaksi sebelumnya!",
          });
        }

        for (const topping of transactionDetail.toppings) {
          const updatedTopping = {
            menu_detail_id: topping.menu_detail_id,
            total_item: topping.total_item,
            updated_at: thisTimeNow,
          };

          await TransactionTopping.update(topping.transaction_topping_id, updatedTopping);

          if (topping.transaction_topping_id == undefined) {
            updatedTopping.transaction_detail_id = transactionDetail.transaction_detail_id;
            updatedTopping.serving_type_id = transactionDetail.serving_type_id;
            await TransactionTopping.create(updatedTopping);
          }
        }

        if (toppingIdsToDelete.length > 0) {
          for (const toppingIdToDelete of toppingIdsToDelete) {
            await TransactionTopping.delete(toppingIdToDelete, deletedAtNow);
          }
        }
      }
    }

    if (transactionDetailIdsToDelete.length > 0) {
      for (const transactionDetailIdToDelete of transactionDetailIdsToDelete) {
        await TransactionDetail.delete(transactionDetailIdToDelete, deletedAtNow);
      }
    }

    return res.status(201).json({
      message: "Data transaksi berhasil diubah!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while updating the transaction",
    });
  }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  const { outlet_id } = req.query;
  try {
    const transaction = await Transaction.getById(id);
    console.log(transaction);
    const cartDetails = await CartDetail.getByCartId(transaction.cart_id)
    const servingTypes = await ServingType.getAll();

    console.log(cartDetails);

    // const transactionDetails = await TransactionDetail.getAllByTransactionID(id);
    // for (const transactionDetail of transactionDetails) {
    //   let menuDetail;
    //   const servingType = servingTypes.find((type) => type.id == transactionDetail.serving_type_id);
    //   const menu = await Menu.getById(transactionDetail.menu_id);

    //   if (transactionDetail.menu_detail_id) {
    //     menuDetail = await MenuDetail.getByID(transactionDetail.menu_detail_id);
    //     transactionDetail.menu_price = priceDeterminant(menuDetail.price, servingType.name, servingType.percent);
    //   }

    //   if (transactionDetail.menu_detail_id) {
    //     transactionDetail.menu_varian = menuDetail.varian;
    //   } else {
    //     transactionDetail.menu_price = priceDeterminant(menu.price, servingType.name, servingType.percent);
    //   }

    //   transactionDetail.menu_name = menu.name;
    //   transactionDetail.menu_type = menu.menu_type;

    //   transactionDetail.serving_type = servingType.name;
    //   transactionDetail.serving_type_percent = servingType.percent;

    //   const toppings = await TransactionTopping.getAllByTransactionDetailID(transactionDetail.transaction_detail_id);
    //   if (toppings.length != 0) {
    //     transactionDetail.toppings = [];
    //     for (const topping of toppings) {
    //       const menuTopping = await MenuDetail.getByID(topping.menu_detail_id);
    //       transactionDetail.toppings.push({
    //         transaction_topping_id: topping.transaction_topping_id,
    //         menu_detail_id: topping.menu_detail_id,
    //         topping_name: menuTopping.varian,
    //         topping_price: menuTopping.price,
    //         topping_total_item: topping.total_item,
    //       });
    //     }
    //   }

    //   if (transactionDetail.menu_detail_id == null) {
    //     delete transactionDetail.menu_detail_id;
    //   }
    // }

    const result = {
      id: transaction.id,
      receipt_number: transaction.receipt_number,
      customer_name: transaction.customer_name,
      customer_seat: transaction.customer_seat,
      subtotal: transaction.subtotal,
      total: transaction.total,
      transaction_detail: transactionDetails,
    };

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the transaction",
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const deletedAtNow = {
      deleted_at: new Date(),
    };

    const transactionDetails = await TransactionDetail.getAllByTransactionID(transactionId);

    for (const transactionDetail of transactionDetails) {
      await TransactionDetail.delete(transactionDetail.transaction_id, deletedAtNow);
      await TransactionTopping.delete(transactionDetail.transaction_detail_id, deletedAtNow);
    }

    await Transaction.delete(transactionId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data transaksi",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting menu",
    });
  }
};

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
