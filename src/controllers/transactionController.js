const Transaction = require('../models/transaction');
const TransactionDetail = require('../models/transaction_detail');
const Topping = require('../models/transaction_toppings');

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
            data: filteredTransactions
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch transactions',
        })
    }
}

exports.createTransaction = async (req, res) => {
    try {
        let transaction = {}
        if(!req.body.transaction_id) {
            transaction = {
                customer_name: req.body.customer_name,
                customer_seat: req.body.customer_seat,
                subtotal: req.body.subtotal,
                total: req.body.total,
            }
        }

        if(req.body.customer_cash) {
            transaction.customer_cash = req.body.customer_cash,
            transaction.customer_change = req.body.customer_change,
            transaction.payment_type = req.body.payment_type
        };

        if(req.body.delivery_type) {
            transaction.delivery_type = req.body.delivery_type,
            transaction.delivery_note = req.body.delivery_note
        }

        let createdTransaction
        if(!req.body.transaction_id) {
            createdTransaction = await Transaction.create(transaction)
        } else {
            createdTransaction = await Transaction.update(req.body.transaction_id, transaction)
        }

        if (req.body.transaction_details) 
        {
            const transactionDetails = req.body.transaction_details;
            for (const transactionDetail of transactionDetails) {
                const newTransactionDetail = {
                    transaction_id: createdTransaction.insertId,
                    menu_detail_id: transactionDetail.menu_detail_id,
                    total_item: transactionDetail.total_item,
                    note_item: transactionDetail.note_item,
                };
    
                const createdTransactionDetail = await TransactionDetail.create(newTransactionDetail);
                if (transactionDetail.topping) {
                    const toppings = transactionDetail.topping;
                    for (const topping of toppings) {
                        const newTopping = {
                            transaction_detail_id: createdTransactionDetail.insertId,
                            menu_detail_id: topping.topping_id,
                            total_item: topping.total_topping,
                        };
                
                        await Topping.create(newTopping);
                    };
                };
            };
        }

        return res.status(201).json({
            message: "Data transaksi berhasil ditambahkan!",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Some error occurred while creating the transaction',
        })
    }
}