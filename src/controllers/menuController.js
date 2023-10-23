const multer = require('multer');
const Menu = require("../models/menu");
const MenuDetail = require("../models/menu_detail");
const CustomPrice = require("../models/custom_price")
const fs = require('fs');

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

    const menu = await Menu.getById(id);
    const menuDetails = await MenuDetail.getAllVarianByMenuID(id);

    const result = {
      id: menu.id,
      name: menu.name,
      menu_type: menu.menu_type,
      image_url: menu.image_url,
      price: menu.price,
      dine_in_price: menu.price,
      take_away_price: menu.price + (menu.price * 3) / 100,
      delivery_service_price: menu.price + (menu.price * 10) / 100,
      gofood_price: menu.price + (menu.price * 20) / 100 + 1000,
      grabfood_price: menu.price + (menu.price * 30) / 100,
      shopeefood_price: menu.price + (menu.price * 20) / 100,
    };

    if(menuDetails.length > 0) {
      for (const menuDetail of menuDetails) {
        menuDetail.dine_in_price = menuDetail.price;
        menuDetail.take_away_price = menuDetail.price + (menuDetail.price * 3) / 100;
        menuDetail.delivery_service_price = menuDetail.price + (menuDetail.price * 10) / 100;
        menuDetail.gofood_price = menuDetail.price + (menuDetail.price * 20) / 100 + 1000;
        menuDetail.grabfood_price = menuDetail.price + (menuDetail.price * 30) / 100;
        menuDetail.shopeefood_price = menuDetail.price + (menuDetail.price * 20) / 100;
      }
    }
    
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


exports.getMenuDetailByMenuId = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.getById(id);
    const menuDetails = await MenuDetail.getAllVarianByMenuID(id);

    const result = {
      id: menu.id,
      menu_type: menu.menu_type,
    };

    const originalVarian = {
      index: 0,
      menu_detail_id: 0,
      varian: null,
      name : menu.name,
      price: menu.price,
      dine_in_price: menu.price,
      take_away_price: menu.price + (menu.price * 3) / 100,
      delivery_service_price: menu.price + (menu.price * 10) / 100,
      gofood_price: menu.price + (menu.price * 20) / 100 + 1000,
      grabfood_price: menu.price + (menu.price * 30) / 100,
      shopeefood_price: menu.price + (menu.price * 20) / 100,
    }

    const menuVariants = menuDetails.map((menuDetail, index) => ({
      index: index + 1,
      menu_detail_id: menuDetail.menu_detail_id,
      varian: menuDetail.varian,
      name: menu.name,
      price: menuDetail.price,
      dine_in_price: menuDetail.price,
      take_away_price: menuDetail.price + (menuDetail.price * 3) / 100,
      delivery_service_price: menuDetail.price + (menuDetail.price * 10) / 100,
      gofood_price: menuDetail.price + (menuDetail.price * 20) / 100 + 1000,
      grabfood_price: menuDetail.price + (menuDetail.price * 30) / 100,
      shopeefood_price: menuDetail.price + (menuDetail.price * 20) / 100,
    }));

    result.menu_details = [originalVarian, ...menuVariants];

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to get menu",
    });
  }
}

// exports.createMenu = async (req, res) => {
//   try {
//     const { name, menu_type, price, menu_details } = req.body;

//     const menu = {
//       name: name,
//       menu_type: menu_type,
//       price: price,
//     };

//     const createdMenu = await Menu.createMenu(menu);

//     const customPriceIds = await CustomPrice.getAllCustomPrices();
//     const customPricesToInsert = customPriceIds.map(item => ({
//       menu_id : createdMenu.insertId,
//       menu_detail_id : 0,
//       price : price,
//       custom_price_id: item.id,
//     }));

//     await CustomPrice.createMultiple(customPricesToInsert);

//     if (menu_details) {
//       const menuId = createdMenu.insertId;
//       for (const menuDetail of menu_details) {
//         const menuDetailData = {
//           menu_id: menuId,
//           price: menuDetail.price,
//           varian: menuDetail.varian,
//         };

//         if (menuDetail.is_topping) {
//           menuDetailData.is_topping = true;
//         }

//         const createdMenuVarian = await MenuDetail.create(menuDetailData);

//         const customVarianPricesToInsert = customPriceIds.map(item => ({
//           menu_id : menuId,
//           menu_detail_id : createdMenuVarian.insertId,
//           price : menuDetail.price,
//           custom_price_id: item.id,
//         }));

//         await CustomPrice.createMultiple(customVarianPricesToInsert);
//       }
//     }

//     return res.status(201).json({
//       message: "Data menu berhasil ditambahkan!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Some error occurred while creating the Menu",
//     });
//   }
// };

// exports.updateMenu = async (req, res) => {
//   try {
//     const menuId = req.params.id;
//     const { name, menu_type, price, menu_details } = req.body;
//     const deletedAtNow = {
//       deleted_at: new Date(),
//     };

//     const updatedMenu = {
//       name: name,
//       menu_type: menu_type,
//       price: price,
//     };
//     await Menu.updateMenu(menuId, updatedMenu);

//     const oldMenuDetails = await MenuDetail.getAllByMenuID(menuId);
//     const oldMenuDetailIds = oldMenuDetails.map((item) => item.menu_detail_id);
//     const menuDetailsIds = menu_details.filter((item) => item.menu_detail_id !== undefined).map((item) => item.menu_detail_id);
//     const menuDetailIdsToDelete = oldMenuDetailIds.filter((id) => !menuDetailsIds.includes(id));
//     const invalidMenuDetailIds = menuDetailsIds.filter((id) => !oldMenuDetailIds.includes(id));
//     if (invalidMenuDetailIds.length > 0) {
//       return res.status(400).json({
//         message: "Terdapat varian menu yang tidak terdaftar pada menu!",
//       });
//     }

//     for (const menuDetail of menu_details) {
//       const updatedMenuDetail = {
//         varian: menuDetail.varian,
//         price: menuDetail.price,
//       };

//       await MenuDetail.update(menuDetail.menu_detail_id, updatedMenuDetail);

//       if (menuDetail.menu_detail_id == undefined) {
//         updatedMenuDetail.menu_id = menuId;
//         await MenuDetail.create(updatedMenuDetail);
//       }
//     }   

//     if (menuDetailIdsToDelete.length > 0) {
//       for (const menuDetailIdToDelete of menuDetailIdsToDelete) {
//         await MenuDetail.delete(menuDetailIdToDelete, deletedAtNow);
//       }
//     }

//     return res.status(200).json({
//       message: "Berhasil mengubah data menu!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Error to update menu",
//     });
//   }
// };

exports.deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const deletedAtNow = {
      deleted_at: new Date(),
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

    return res.status(200).json({
      data: menus,
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
      const currentTime = new Date().toISOString().replace(/:/g, "-");
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

    const customPriceIds = await CustomPrice.getAllCustomPrices();

    const customPricesToInsert = customPriceIds.map(item => ({
      menu_id : createdMenu.insertId,
      menu_detail_id : 0,
      price : price,
      custom_price_id: item.id,
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
          custom_price_id: item.id,
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
  try {
    const menuId = req.params.id;
    const { name, menu_type, price, menu_details, is_active, outlet_id } = req.body;
    const deletedAtNow = {
      deleted_at: new Date(),
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
      updated_at: new Date(),
    };

    // Check if a new image is uploaded
    if (req.file) {
      const currentTime = new Date().toISOString().replace(/:/g, "-");
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
    
    if (menu_details) {
      const oldMenuDetails = await MenuDetail.getAllByMenuID(menuId);
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
          await MenuDetail.create({
            menu_id: menuId,
            varian: menuDetail.varian,
            price: menuDetail.price,
          });
        } else {
          const updatedMenuDetail = {
            varian: menuDetail.varian,
            updated_at: new Date(),
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

    return res.status(200).json({
      message: "Berhasil mengubah data menu!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update menu",
    });
  }
};