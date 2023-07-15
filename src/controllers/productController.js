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

exports.getProductById = async (req, res) => {
    try {
        const product = await Products.getById(req.params.id)
    
        if (product.length == 0) {
            return res.status(404).json({
                message: "Product not found!"
            })   
        }
    
        return res.status(200).json({
            data: product
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error to get product',
        })
    }
}

exports.createProduct = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                message: 'Nama Produk tidak boleh kosong!',
            });
        }

        const product = {
            id_outlet: req.body.id_outlet,
            name: req.body.name,
            stock: req.body.stock,
            cost: req.body.cost,
            unit: req.body.unit,
        }

        await Products.create(product)

        return res.status(201).json({
            message: "Data Produk berhasil ditambahkan!",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Some error occurred while creating the Product',
        })
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const oldProduct = await Products.getById(req.params.id)
       
        if(oldProduct.length == 0) {
            return res.status(404).json({
                message: "Product not found!"
            })  
        }
        
        const product = {
            id_outlet: req.body.id_outlet || oldProduct.id_outlet,
            name: req.body.name || oldProduct.name,
            stock: req.body.stock || oldProduct.stock,
            cost: req.body.stock || oldProduct.stock,
            unit: req.body.unit || oldProduct.unit,
        }

        await Products.update(req.params.id, product)

        return res.status(200).json({
            message: "Berhasil mengubah data product",
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error to update product',
        })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Products.getById(req.params.id)

        if(product.changedRows == 0) {
            res.status(404).json({
                message: `Product not found!`
            })
        }

        const data ={
            deleted_at: new Date()
        }

        await Products.delete(req.params.id, data)

        res.status(200).json({
            message: "Berhasil menghapus data product",
        })

    } catch(error) {
        res.status(500).json({
            message: error || 'Error to get product',
        })
    }
};