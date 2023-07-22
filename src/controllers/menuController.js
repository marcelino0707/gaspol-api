const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");

exports.getMenus = async (req, res) => {
  try {
    let menus;

    if (req.query.name) {
      menus = await Menu.getAllByMenuName(req.query.name);
    } else {
      menus = await Menu.getAll();
    }

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

    const menu = await Menu.getById(id);
    const menuDetails = await MenuDetail.getAllByMenuID(id);

    for (const menuDetail of menuDetails) {
      menuDetail.take_away_price = menuDetail.dine_in_price + (menuDetail.dine_in_price * 3) / 100;
      menuDetail.gofood_price = menuDetail.dine_in_price + (menuDetail.dine_in_price * 25) / 100;
      menuDetail.grabfood_price = menuDetail.dine_in_price + (menuDetail.dine_in_price * 5) / 100;
      menuDetail.delivery_service_price = menuDetail.dine_in_price + (menuDetail.dine_in_price * 10) / 100;
    }

    const result = {
      id: menu.id,
      name: menu.name,
      menu_type: menu.menu_type,
      dine_in_price: menu.dine_in_price,
      take_away_price: menu.dine_in_price + (menu.dine_in_price * 3) / 100,
      gofood_price: menu.dine_in_price + (menu.dine_in_price * 25) / 100,
      grabfood_price: menu.dine_in_price + (menu.dine_in_price * 5) / 100,
      delivery_service_price: menu.dine_in_price + (menu.dine_in_price * 10) / 100,
      menu_details: menuDetails,
    };

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get menu",
    });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { name, menu_type, price, menu_details } = req.body;

    const menu = {
      name: name,
      menu_type: menu_type,
      price: price,
    };

    let menuId;
    if (!req.query.menu_id) {
      const createdMenu = await Menu.createMenu(menu);
      menuId = createdMenu.insertId;
    } else {
      menuId = req.query.menu_id;
    }

    for (const menuDetail of menu_details) {
      const menuDetailData = {
        menu_id: menuId,
        price: menuDetail.price,
        varian: menuDetail.varian,
      };

      await MenuDetail.create(menuDetailData);
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

    if (oldMenuDetail.length == 0) {
      return res.status(404).json({
        message: "Menu not found!",
      });
    }

    const updatedMenu = {
      name: req.body.name || oldMenuDetail.name,
      menu_type: req.body.menu_type || oldMenuDetail.menu_type,
      price: req.body.price || oldMenuDetail.price,
    };

    if (req.body.name != oldMenuDetail.name || req.body.menu_type != oldMenuDetail.menu_type || req.body.price != oldMenuDetail.price) {
      await Menu.updateMenus(menuId, updatedMenu);
    }

    if (req.body.menu_details) {
      for (const menuDetail of req.body.menu_details) {
        const updatedMenuDetail = {
          varian: menuDetail.varian,
          price: menuDetail.price,
        };

        await MenuDetail.update(menuDetail.menu_detail_id, updatedMenuDetail);
      }
    }

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
    const menuId = req.params.id;
    const menu = await Menu.getByMenuId(menuId);

    if (menu.length == 0) {
      return res.status(404).json({
        message: "Menu not found!",
      });
    }

    for (const menuDetailId of req.body.menu_detail_id) {
      const deletedAtNow = {
        deleted_at: new Date(),
      };

      const menuDetailRemainingOne = await checkRemainingOneData(menuId);

      await MenuDetail.delete(menuDetailId, deletedAtNow);

      if (menuDetailRemainingOne) {
        await Menu.delete(menuId, deletedAtNow);
      }
    }

    return res.status(200).json({
      message: "Berhasil menghapus data Menu Detail",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting Menu Detail",
    });
  }
};

async function checkRemainingOneData(menuId) {
  const existMenuDetail = await MenuDetail.getIdByMenuID(menuId);

  if (existMenuDetail.length == 1) {
    return true;
  }

  return false;
}
