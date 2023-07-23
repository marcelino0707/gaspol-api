const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.getAll();

    for (const menu of menus) {
      menu.dine_in_price = menu.price;
      menu.take_away_price = menu.price + (menu.price * 3) / 100;
      menu.delivery_service_price = menu.price + (menu.price * 10) / 100;
      menu.gofood_price = menu.price + (menu.price * 20) / 100 + 1000;
      menu.grabfood_price = menu.price + (menu.price * 30) / 100;
      menu.shopeefood_price = menu.price + (menu.price * 20) / 100;
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
      menuDetail.dine_in_price = menuDetail.price;
      menuDetail.take_away_price = menuDetail.price + (menuDetail.price * 3) / 100;
      menuDetail.delivery_service_price = menuDetail.price + (menuDetail.price * 10) / 100;
      menuDetail.gofood_price = menuDetail.price + (menuDetail.price * 20) / 100 + 1000;
      menuDetail.grabfood_price = menuDetail.price + (menuDetail.price * 30) / 100;
      menuDetail.shopeefood_price = menuDetail.price + (menuDetail.price * 20) / 100;
    }

    const result = {
      id: menu.id,
      name: menu.name,
      menu_type: menu.menu_type,
      price: menu.price,
      dine_in_price: menu.price,
      take_away_price: menu.price + (menu.price * 3) / 100,
      delivery_service_price: menu.price + (menu.price * 10) / 100,
      gofood_price: menu.price + (menu.price * 20) / 100 + 1000,
      grabfood_price: menu.price + (menu.price * 30) / 100,
      shopeefood_price: menu.price + (menu.price * 20) / 100,
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

    if(menu_details) {
      for (const menuDetail of menu_details) {
        const menuDetailData = {
          menu_id: menuId,
          price: menuDetail.price,
          varian: menuDetail.varian,
        };
  
        await MenuDetail.create(menuDetailData);
      }
    }

    return res.status(201).json({
      message: "Data menu berhasil ditambahkan!",
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

    if (req.body.name || req.body.menu_type || req.body.price) {
      const updatedMenu = {};

      if (req.body.name) {
        updatedMenu.name = req.body.name;
      }

      if (req.body.menu_type) {
        updatedMenu.menu_type = req.body.menu_type;
      }

      if (req.body.price) {
        updatedMenu.price = req.body.price;
      }

      await Menu.updateMenu(menuId, updatedMenu);
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
      message: "Berhasil mengubah data menu!",
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
    const { menu_details_id } = req.body;
    const deletedAtNow = {
      deleted_at: new Date(),
    };

    if (menu_details_id) {
      for (const menu_detail_id of menu_details_id) {
        await MenuDetail.delete(menu_detail_id, deletedAtNow);
      }
    } else {
      const menuDetails = await MenuDetail.getAllByMenuID(menuId);

      if (menuDetails) {
        for (const menuDetail of menuDetails) {
          await MenuDetail.delete(menuDetail.menu_detail_id, deletedAtNow);
        }
      }

      await Menu.delete(menuId, deletedAtNow);
    }
    return res.status(200).json({
      message: "Berhasil menghapus data menu",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting menu",
    });
  }
};
