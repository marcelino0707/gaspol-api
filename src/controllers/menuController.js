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

exports.getMenuById = async (req, res) => {
    try {
        const { id } = req.params;
        const serving_type_id = req.query.serving_type_id;

        let menu;

        if (serving_type_id) {
            menu = await Menus.getByServingTypeId(id, serving_type_id);
        } else {
            menu = await Menus.getByMenuId(id);
        }
    
        if (menu.length == 0) {
            return res.status(404).json({
                message: "Menu not found!"
            })   
        }
    
        return res.status(200).json({
            data: menu
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error to get menu',
        })
    }
}

