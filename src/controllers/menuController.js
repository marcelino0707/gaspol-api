const Menus = require('../models/menu');

exports.getMenus = async (req, res) => {
    try {
        const menus = await Menus.getAll();
        
        return res.status(200).json({
            data: menus
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch menus',
        })
    }
}

