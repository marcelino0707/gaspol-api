const Outlet = require('../models/outlet');

exports.getOutlets = async (req, res) => {
    try {
        const outlets = await Outlet.getAll();

        return res.status(200).json({
            data: outlets
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch outlets',
        })
    }
}

exports.getProductId = async (req, res) => {
    try {
        const category = await Category.getById(req.params.id)
    
        if (category.length == 0) {
            return res.status(404).json({
                message: "Category not found!"
            })   
        }
    
        return res.status(200).json({
            data: category
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error to get category',
        })
    }
}

exports.create = async (req, res) => {
    try {
        if (!req.body.fNamaKat) {
            return res.status(400).json({
                message: 'Nama kategori tidak boleh kosong!',
            });
        }

        const category = {
            fNamaKat: req.body.fNamaKat,
            fSlugKat: req.body.fSlugKat,
            fketerangan: req.body.fketerangan,
        }

        await Category.create(category)

        return res.status(201).json({
            message: "Kategori berhasil ditambahkan!",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Some error occurred while creating the category',
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const category = await Category.delete(req.params.id)

        if(category.changedRows == 0) {
            res.status(404).json({
                message: `Category not found!`
            })
        }

        res.status(200).json({
            message: "Berhasil menghapus data kategori",
        })

    } catch(error) {
        res.status(500).json({
            message: error || 'Error to get category',
        })
    }
};

exports.update = async (req, res) => {
    try {
        const oldCategory = await Category.getById(req.params.id)

        if(oldCategory.length == 0) {
            return res.status(404).json({
                message: "Category not found!"
            })  
        }
        
        const category = {
            fNamaKat: req.body.fNamaKat || oldCategory[0].fNamaKat,
            fSlugKat: req.body.fSlugKat || oldCategory[0].fSlugKat,
            fketerangan: req.body.fketerangan || oldCategory[0].fketerangan,
        }

        await Category.update(req.params.id, category)

        return res.status(200).json({
            message: "Berhasil mengubah data kategori",
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error to update category',
        })
    }
}