const multer = require('multer');
const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");
const CustomPrice = require("../models/custom_price")
const ServingType = require("../models/serving_type")
const fs = require('fs');
const moment = require("moment-timezone");

exports.getMenus = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const menus = await Menu.getAll(outlet_id);

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
    const { outlet_id } = req.query;

    const servingTypes = await ServingType.getAll(outlet_id);
    const customMenuPrices = await CustomPrice.getCustomMenuPricesByMenuId(id);

    // Main Menu
    const menu = await Menu.getById(id);
    const mainMenuPrices = customMenuPrices.filter(
      (customPrice) => customPrice.menu_detail_id == 0
    )
    const sanitizedCustomMainMenuPrices = mainMenuPrices.map((priceObj) => {
      const { id, menu_detail_id, varian, ...sanitizedPriceObj } = priceObj;
      return sanitizedPriceObj;
    })

    // Menu Variant
    const menuDetails = await MenuDetail.getAllVarianByMenuID(id);
    const menuDetailsWithCustomMenuPrices = menuDetails.map((item) => {
      const customMenuDetailPrices = customMenuPrices.filter(
        (customPrice) =>  customPrice.menu_detail_id == item.menu_detail_id
      );
      delete item.price;
      const sanitizedCustomMenuDetailPrices = customMenuDetailPrices.map((priceObj) => {
        const { id, menu_detail_id, varian, ...sanitizedPriceObj } = priceObj;
        return sanitizedPriceObj;
      });
      return {
        ...item,
        menu_prices: [...sanitizedCustomMenuDetailPrices],
      }
    })

    const result = {
      id: menu.id,
      name: menu.name,
      menu_type: menu.menu_type,
      image_url: menu.image_url,
      menu_prices: sanitizedCustomMainMenuPrices,
      serving_types: servingTypes,
      menu_details: menuDetailsWithCustomMenuPrices,
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

exports.getMenuDetailByMenuId = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_detail_id } = req.query;
    let result;
    if(menu_detail_id) {
      const mainMenu = await Menu.getById(id);
      const menuVarian = await MenuDetail.getByID(menu_detail_id);
      const customMenuPrices = await CustomPrice.getCustomMenuPricesByMenuId(id);
      result = {
        id: id,
        menu_type: mainMenu.menu_type,
      };
      let originalVarian;
      if (menu_detail_id == 0) {
        originalVarian = {
          index : 0,
          menu_detail_id: 0,
          varian: null,
          name : mainMenu.name,
        }
      } else {
        originalVarian = {
          index : 0,
          menu_detail_id: menuVarian.menu_detail_id,
          varian: menuVarian.varian,
          name : mainMenu.name,
        }
      }
      const menuPrices = customMenuPrices.filter(
        (customPrice) => customPrice.menu_detail_id == menu_detail_id
      )

      const sanitizedCustomMenuPrices = menuPrices.map((priceObj) => {
        const { serving_type_id: id, name, price } = priceObj;
        return { id, name, price };
      })

      originalVarian.serving_types = sanitizedCustomMenuPrices

      result.menu_details = [originalVarian]
    } else {
      const menu = await Menu.getById(id);
      const menuDetails = await MenuDetail.getAllVarianByMenuID(id);
      result = {
        id: menu.id,
        menu_type: menu.menu_type,
      };
  
      const originalVarian = {
        index: 0,
        menu_detail_id: 0,
        varian: null,
        name : menu.name,
        serving_types: [],
      }
  
      const menuVariants = menuDetails.map((menuDetail, index) => ({
        index: index + 1,
        menu_detail_id: menuDetail.menu_detail_id,
        varian: menuDetail.varian,
        name: menu.name,
        serving_types: [],
      }));
  
      result.menu_details = [originalVarian, ...menuVariants];
    }

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get menu",
    });
  }
}

exports.deleteMenu = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const menuId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    const deletedMenu = await Menu.delete(menuId, deletedAtNow);
    if (deletedMenu.affectedRows == 0) {
      return res.status(404).json({
        message: "Menu yang ingin dihapus tidak terdaftar!",
      });
    }

    await MenuDetail.deleteByMenuID(menuId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data menu",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting menu",
    });
  }
};

// Define the storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/menus/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create a multer instance with storage configuration
multer({ storage: storage });

exports.getMenusV2 = async (req, res) => {
  const { outlet_id } = req.query;
  try {
    const menus = await Menu.getAllCMS(outlet_id);
    const customPriceIds = menus.map((item) => item.id);
    const prices = await CustomPrice.getPricesByMenuIdsCMS(customPriceIds);
    const menusWithPrice = menus.map(menu => {
      const price = prices.find(pr => pr.menu_id == menu.id);
      return { ...menu, price: price ? price.price : null };
    });
    return res.status(200).json({
      data: menusWithPrice,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch menus",
    });
  }
};

exports.getMenuByIdV2 = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.getByIdCMS(id);
    const menuDetails = await MenuDetail.getAllVarianByMenuID(id);
    const result = {
      id: menu.id,
      name: menu.name,
      menu_type: menu.menu_type,
      image_url: menu.image_url,
      price: menu.price,
      outlet_id: menu.outlet_id,
      is_active: menu.is_active,
      dine_in_price: menu.price,
    };

    result.menu_details = [...menuDetails];

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get menu",
    });
  }
};

exports.createMenuV2 = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  let uploadedFilePath = "";
  const { name, menu_type, price, menu_details, outlet_id, is_active } = req.body;
  const menu = {
    name: name,
    menu_type: menu_type,
    price: price,
    is_active: is_active,
    outlet_id: outlet_id,
  };
  let menuDetails;
  if(menu_details) {
    menuDetails =  JSON.parse(menu_details);
  }
  try {
    if (req.file) {
      const currentTime = indoDateTime.toISOString().replace(/:/g, "-");
      const fileExtension = req.file.originalname.split(".").pop();
      const sanitizedName = name.replace(/ /g, "-");
      const fileName = `${sanitizedName}-${currentTime}-${outlet_id}.${fileExtension}`;
      const menuDir = `public/${outlet_id}/menus`;

      // Create new directory if not exists
      if (!fs.existsSync(menuDir)) {
        fs.mkdirSync(menuDir, { recursive: true });
      }

      // Save the uploaded file with the new filename
      fs.writeFileSync(`${menuDir}/${fileName}`, req.file.buffer);

      // Set the image_url to the new file path
      menu.image_url = `${menuDir}/${fileName}`;
      uploadedFilePath = `${menuDir}/${fileName}`;
    }

    const createdMenu = await Menu.createMenu(menu);

    const customPriceIds = await ServingType.getAllCMS(outlet_id);

    const customPricesToInsert = customPriceIds.map(item => ({
      menu_id : createdMenu.insertId,
      menu_detail_id : 0,
      price : price,
      serving_type_id: item.id,
    }));

    await CustomPrice.createMultiple(customPricesToInsert);

    if (menu_details) {
      const menuId = createdMenu.insertId;
      for (const menuDetail of menuDetails) {
        const menuDetailData = {
          menu_id: menuId,
          price: menuDetail.price,
          varian: menuDetail.varian,
        };

        if (menuDetail.is_topping) {
          menuDetailData.is_topping = true;
        }

        const createdMenuVarian = await MenuDetail.create(menuDetailData);

        const customVarianPricesToInsert = customPriceIds.map(item => ({
          menu_id : menuId,
          menu_detail_id : createdMenuVarian.insertId,
          price : menuDetail.price,
          serving_type_id: item.id,
        }));

        await CustomPrice.createMultiple(customVarianPricesToInsert);
      }
    }

    return res.status(201).json({
      message: "Data menu berhasil ditambahkan!",
    });
  } catch (error) {
    // Handle the error, and if necessary, delete the uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the Menu",
    });
  }
};

exports.updateMenuV2 = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const menuId = req.params.id;
    const { name, menu_type, price, menu_details, is_active, outlet_id } = req.body;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    let menuDetails;
    if(menu_details) {
      menuDetails =  JSON.parse(menu_details);
    }

    const updatedMenu = {
      name: name,
      menu_type: menu_type,
      price: price,
      is_active: is_active,
      outlet_id: outlet_id,
      updated_at: indoDateTime,
    };

    // Check if a new image is uploaded
    if (req.file) {
      const currentTime = indoDateTime.toISOString().replace(/:/g, "-");
      const fileExtension = req.file.originalname.split(".").pop();
      const sanitizedName = name.replace(/ /g, "-");
      const fileName = `${sanitizedName}-${currentTime}-${outlet_id}.${fileExtension}`;
      const menuDir = `public/${outlet_id}/menus`;

      // Create new directory if not exists
      if (!fs.existsSync(menuDir)) {
        fs.mkdirSync(menuDir, { recursive: true });
      }

      // Save the uploaded file with the new filename
      fs.writeFileSync(`${menuDir}/${fileName}`, req.file.buffer);

      // Set the image_url to the new file path
      updatedMenu.image_url = `${menuDir}/${fileName}`;

      // Delete the old image if it exists
      const oldMenu = await Menu.getById(menuId);
      if (oldMenu && fs.existsSync(oldMenu.image_url)) {
        fs.unlinkSync(oldMenu.image_url);
      }
    }

    await Menu.updateMenu(menuId, updatedMenu);
    
    const oldMenuDetails = await MenuDetail.getAllByMenuID(menuId);
    if (menu_details && oldMenuDetails) {
      const oldMenuDetailIds = oldMenuDetails.map((item) => item.menu_detail_id);
      const menuDetailsIds = menuDetails.filter((item) => item.menu_detail_id !== undefined).map((item) => item.menu_detail_id);
      const menuDetailIdsToDelete = oldMenuDetailIds.filter((id) => !menuDetailsIds.includes(id));
      const invalidMenuDetailIds = menuDetailsIds.filter((id) => !oldMenuDetailIds.includes(id));
      if (invalidMenuDetailIds.length > 0) {
        return res.status(400).json({
          message: "Terdapat varian menu yang tidak terdaftar pada menu!",
        });
      }
  
      for (const menuDetail of menuDetails) {
        if (menuDetail.menu_detail_id == undefined) {
          const createdMenuVariant = await MenuDetail.create({
            menu_id: menuId,
            varian: menuDetail.varian,
            price: menuDetail.price,
          });

          const customPriceIds = await ServingType.getAllCMS(outlet_id);

          const customPricesToInsert = customPriceIds.map(item => ({
            menu_id : menuId,
            menu_detail_id : createdMenuVariant.insertId,
            price : menuDetail.price,
            serving_type_id: item.id,
          }));

          await CustomPrice.createMultiple(customPricesToInsert);
        } else {
          const updatedMenuDetail = {
            varian: menuDetail.varian,
            updated_at: indoDateTime,
          };
    
          await MenuDetail.update(menuDetail.menu_detail_id, updatedMenuDetail);
        }
      }   
  
      if (menuDetailIdsToDelete.length > 0) {
        for (const menuDetailIdToDelete of menuDetailIdsToDelete) {
          await MenuDetail.delete(menuDetailIdToDelete, deletedAtNow);
        }
      }
    }

    if(menu_details == undefined && oldMenuDetails) {
      for (const oldMenuDetail of oldMenuDetails) {
        await MenuDetail.delete(oldMenuDetail.menu_detail_id, deletedAtNow);
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