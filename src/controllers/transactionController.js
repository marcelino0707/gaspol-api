const Transaction = require('../models/transaction');
const TransactionDetail = require('../models/transaction_detail');
const Topping = require('../models/transaction_toppings');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getAll();
        
        return res.status(200).json({
            data: transactions
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch transactions',
        })
    }
}

exports.createTransaction = async (req, res) => {
    try {
        if (!req.body.customer_name) {
            return res.status(400).json({
                message: 'Nama customer tidak boleh kosong!',
            });
        }

        if (!req.body.subtotal) {
            return res.status(400).json({
                message: 'Subtotal tidak boleh kosong!',
            });
        }

        if (!req.body.total) {
            return res.status(400).json({
                message: 'Total tidak boleh kosong!',
            });
        }

        const transaction = {
            customer_name: req.body.customer_name,
            customer_seat: req.body.customer_seat,
            subtotal: req.body.subtotal,
            total: req.body.total,
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

        const createdTransaction = await Transaction.create(transaction)

        const transactionDetails = req.body.transaction_details;

        transactionDetails.forEach(async (transactionDetail) => {
            const newTransactionDetail = {
                transaction_id: createdTransaction.insertId,
                menu_detail_id: transactionDetail.menu_detail_id,
                total_item: transactionDetail.total_item,
                note_item: transactionDetail.note_item,
            };

            const createdTransactionDetail = await TransactionDetail.create(newTransactionDetail);

            if (transactionDetail.topping) {
                const toppings = transactionDetail.topping;
                toppings.forEach(async (topping) => {
                    const newTopping = {
                        transaction_detail_id: createdTransactionDetail.insertId,
                        topping_id: topping.topping_id,
                        total_topping: topping.total_topping,
                    };
            
                    await Topping.create(newTopping);
                });
            }
        });

        return res.status(201).json({
            message: "Data transaksi berhasil ditambahkan!",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Some error occurred while creating the transaction',
        })
    }
}