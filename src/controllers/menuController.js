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
    const menuDetails = await MenuDetail.getAllVarianByMenuID(id);

    for (const menuDetail of menuDetails) {
      menuDetail.dine_in_price = menuDetail.price;
      menuDetail.take_away_price = menuDetail.price + (menuDetail.price * 3) / 100;
      menuDetail.delivery_service_price = menuDetail.price + (menuDetail.price * 10) / 100;
      menuDetail.gofood_price = menuDetail.price + (menuDetail.price * 20) / 100 + 1000;
      menuDetail.grabfood_price = menuDetail.price + (menuDetail.price * 30) / 100;
      menuDetail.shopeefood_price = menuDetail.price + (menuDetail.price * 20) / 100;
    }

    const toppings = await MenuDetail.getAllToppingByMenuID(id);

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
      toppings: toppings,
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

    const createdMenu = await Menu.createMenu(menu);
    
    if(menu_details) {
      const menuId = createdMenu.insertId;
      for (const menuDetail of menu_details) {
        const menuDetailData = {
          menu_id: menuId,
          price: menuDetail.price,
          varian: menuDetail.varian,
        };

        if(menuDetail.is_topping) {
          menuDetailData.is_topping = true;
        }
  
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
    const { name, menu_type, price, menu_details } = req.body;
    const deletedAtNow = {
      deleted_at: new Date(),
    };

    const updatedMenu = {
      name: name,
      menu_type : menu_type,
      price : price
    };
    await Menu.updateMenu(menuId, updatedMenu);

    const oldMenuDetails = await MenuDetail.getAllByMenuID(menuId);
    const oldMenuDetailIds = oldMenuDetails.map(item => item.menu_detail_id);
    const menuDetailsIds = menu_details.filter(item => item.menu_detail_id !== undefined).map(item => item.menu_detail_id);
    const menuDetailIdsToDelete = oldMenuDetailIds.filter(id => !menuDetailsIds.includes(id));
    const invalidMenuDetailIds = menuDetailsIds.filter(id => !oldMenuDetailIds.includes(id));
    if (invalidMenuDetailIds.length > 0) {
      return res.status(400).json({
        message: "Terdapat varian menu yang tidak terdaftar pada menu!",
      });
    }

    for (const menuDetail of menu_details) {
      const updatedMenuDetail = {
        varian: menuDetail.varian,
        price: menuDetail.price,
      };

      if(menuDetail.is_topping) {
        updatedMenuDetail.is_topping = menuDetail.is_topping;
      } else {
        updatedMenuDetail.is_topping = false;
      }

      await MenuDetail.update(menuDetail.menu_detail_id, updatedMenuDetail);

      if(menuDetail.menu_detail_id == undefined) {
        updatedMenuDetail.menu_id = menuId;
        await MenuDetail.create(updatedMenuDetail);
      }
    }

    if(menuDetailIdsToDelete.length > 0) {
      for (const menuDetailIdToDelete of menuDetailIdsToDelete) {
        await MenuDetail.delete(menuDetailIdToDelete, deletedAtNow);
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
    const deletedAtNow = {
      deleted_at: new Date(),
    };

    const deletedMenu = await Menu.delete(menuId, deletedAtNow);
    if(deletedMenu.affectedRows == 0) {
      return res.status(404).json({
        message: "Menu yang ingin dihapus tidak terdaftar!",
      });
    }

    await MenuDetail.deleteByMenuID(menuId, deletedAtNow)

    return res.status(200).json({
      message: "Berhasil menghapus data menu",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting menu",
    });
  }
};
