const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");
const ServingType = require("../models/serving_type");
const Transaction = require("../models/transaction");
const TransactionDetail = require("../models/transaction_detail");
const Topping = require("../models/transaction_topping");
const { priceDeterminant } = require("../utils/generalFunctions");

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
        subtotal: req.body.subtotal,
        total: req.body.total,
        receipt_number: "AT-" + req.body.customer_name + "-" + customer_seat + "-" + generateTimeNow(),
      };
    }

    if (req.body.customer_cash) {
      transaction.customer_cash = req.body.customer_cash,
      transaction.customer_change = req.body.customer_change,
      transaction.payment_type = req.body.payment_type,
      transaction.invoice_number = "INV-" + generateTimeNow() + "-" + req.body.payment_type,
      transaction.invoice_due_date = new Date();
    }

    if (req.body.delivery_type) {
      transaction.delivery_type = req.body.delivery_type, 
      transaction.delivery_note = req.body.delivery_note;
    }

    let createdTransaction;
    if (!req.body.transaction_id) {
      createdTransaction = await Transaction.create(transaction);
    } else {
      createdTransaction = await Transaction.update(req.body.transaction_id, transaction);
    }

    if (req.body.transaction_details) {
      const transactionDetails = req.body.transaction_details;
      for (const transactionDetail of transactionDetails) {
        let newTransactionDetail = {}
        newTransactionDetail.transaction_id = createdTransaction.insertId;
        newTransactionDetail.menu_id = transactionDetail.menu_id;
        newTransactionDetail.serving_type_id = transactionDetail.serving_type_id;
        newTransactionDetail.total_item = transactionDetail.total_item;
        newTransactionDetail.note_item = transactionDetail.note_item;

        if (transactionDetail.menu_varian_id) {
          newTransactionDetail.menu_varian_id = transactionDetail.menu_varian_id;
        }
        
        const createdTransactionDetail = await TransactionDetail.create(newTransactionDetail);

        if (transactionDetail.toppings) {
          const toppings = transactionDetail.toppings;
          for (const topping of toppings) {
            const newTopping = {
              transaction_detail_id: createdTransactionDetail.insertId,
              menu_id: topping.menu_id,
              serving_type_id: transactionDetail.serving_type_id,
              total_item: topping.total_item,
            };

            await Topping.create(newTopping);
          }
        }
      }
    }

    return res.status(201).json({
      message: "Data transaksi berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the transaction",
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.getById(id);
    const transactionDetails = await TransactionDetail.getAllByTransactionID(id);

    for (const transactionDetail of transactionDetails) {
        let menuDetail, menu

        if (transactionDetail.menu_varian_id) {
          menuDetail = await MenuDetail.getByID(transactionDetail.menu_varian_id);
          transactionDetail.menu_varian = menuDetail.varian;
          transactionDetail.menu_price = await priceDeterminant(menuDetail.price, transactionDetail.serving_type_id);
          menu = await Menu.getById(menuDetail.menu_id);
        } else {
          menu = await Menu.getById(transactionDetail.menu_id);
          transactionDetail.menu_price = await priceDeterminant(menu.price, transactionDetail.serving_type_id);
        }

        const servingType = await ServingType.getServingTypeById(transactionDetail.serving_type_id);
        const toppings = await Topping.getAllByTransactionDetailID(transactionDetail.transaction_detail_id);
        
        transactionDetail.menu_name = menu.name;
        transactionDetail.menu_type = menu.menu_type;
        
        transactionDetail.serving_type = servingType.name;
        transactionDetail.serving_type_percent = servingType.percent; 
        
        if(toppings.length != 0) {
            transactionDetail.topping = []
            for (const topping of toppings) {
                const menuTopping = await Menu.getById(topping.menu_id);
                topping.topping_name = menuTopping.name;
                topping.topping_price = await priceDeterminant(menuTopping.price, topping.serving_type_id);
                transactionDetail.topping.push({
                  topping_name : topping.topping_name,
                  topping_price : topping.topping_price,
                  toping_total_item : topping.total_item
                });
            }
        }
    }

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
