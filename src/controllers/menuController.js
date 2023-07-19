const Menu = require("../models/menu");

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.getAll();

    return res.status(200).json({
      data: menus,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch menus",
    });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const serving_type = req.query.serving_type;

    let menu;

    if (serving_type) {
      menu = await Menu.getByServingTypeId(id, serving_type);
    } else {
      menu = await Menu.getByMenuId(id);
    }

    if (menu.length == 0) {
      return res.status(404).json({
        message: "Menu not found!",
      });
    }

    return res.status(200).json({
      data: menu,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get menu",
    });
  }
};

exports.createMenu = async (req, res) => {
  try {
    if (!req.body.menu_details || !Array.isArray(req.body.menu_details) || req.body.menu_details.length === 0) {
      return res.status(400).json({
        message: "Data menu harus berupa array yang berisi setidaknya satu menu.",
      });
    }

    for (const menuDetail of req.body.menu_details) {
      if (!menuDetail.name || !menuDetail.menu_type || !menuDetail.serving_type || !menuDetail.price) {
        return res.status(400).json({
          message: "Semua field pada setiap Menu Detail harus diisi.",
        });
      }

      const menu = {
        name: menuDetail.name,
        menu_type: menuDetail.menu_type,
      };

      const createdMenu = await Menu.createMenus(menu);

      if (!createdMenu.insertId) {
        return res.status(500).json({
          message: "Failed to create Menu in the database.",
        });
      }

      const menuDetailData = {
        menu_id: createdMenu.insertId,
        serving_type: menuDetail.serving_type,
        price: menuDetail.price,
        varian: menuDetail.varian,
      };

      await Menu.createMenuDetail(menuDetailData);
    }

    return res.status(201).json({
      message: "Data Menu berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the Menu",
    });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const oldMenuDetail = await Menu.getByMenuId(menuId);

    if (oldMenuDetail.length === 0) {
      return res.status(404).json({
        message: "Menu not found!",
      });
    }

    const updatedMenu = {
      name: req.body.name || oldMenuDetail.name,
      menu_type: req.body.menu_type || oldMenuDetail.menu_type,
    };

    await Menu.updateMenus(menuId, updatedMenu);

    const updatedMenuDetail = {
      serving_type: req.body.serving_type || oldMenuDetail.serving_type,
      varian: req.body.varian || oldMenuDetail.varian,
      price: req.body.price || oldMenuDetail.price,
    };

    await Menu.updateMenuDetail(menuId, updatedMenuDetail);

    return res.status(200).json({
      message: "Berhasil mengubah data menu",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update menu",
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.getByMenuId(req.params.id);

    if (menu.changedRows == 0) {
      res.status(404).json({
        message: `Menu not found!`,
      });
    }

    const data = {
      deleted_at: new Date(),
    };

    await Menu.delete(req.params.id, data);

    res.status(200).json({
      message: "Berhasil menghapus data Menu",
    });
  } catch (error) {
    res.status(500).json({
      message: error || "Error to get Menu",
    });
  }
};
