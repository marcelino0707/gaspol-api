const Products = require('../models/product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Products.getAll();

        return res.status(200).json({
            data: products
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch products',
        })
    }
}