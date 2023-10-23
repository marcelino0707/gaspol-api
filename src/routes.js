const express = require("express");
const route = express.Router();
const multer = require("multer");
const upload = multer();

// Path Controllers
const product = require("./controllers/productController");
const menu = require("./controllers/menuController");
const transaction = require("./controllers/transactionController");
const servingType = require("./controllers/servingTypeController");
const discount = require("./controllers/discountController");
const refund = require("./controllers/refundController");
const cart = require("./controllers/cartController");
const struct = require("./controllers/structController");
const report = require("./controllers/reportController");
const installmentCart = require("./controllers/installmentCartController");
const authentication = require("./controllers/authenticationController");
const outlet = require("./controllers/outletController");
const user = require("./controllers/userController");
const profile = require("./controllers/profileController");
const customPrice = require("./controllers/customizePriceController");

// Product
route.get("/product", product.getProducts);
route.post("/product", product.createProduct);
route.get("/product/:id", product.getProductById);
route.patch("/product/:id", product.updateProduct);
route.delete("/product/:id", product.deleteProduct);

// Menu
route.get("/menu", menu.getMenus);
// route.post("/menu", menu.createMenu);
route.get("/menu/:id", menu.getMenuById);
// route.patch("/menu/:id", menu.updateMenu);
route.delete("/menu/:id", menu.deleteMenu);

// Menu v2
route.get("/v2/menu", menu.getMenusV2);
route.post("/v2/menu", upload.single('image'), menu.createMenuV2);
route.get("/v2/menu/:id", menu.getMenuByIdV2);
route.patch("/v2/menu/:id", upload.single('image'), menu.updateMenuV2);

// Menu Detail For Cart
route.get("/menu-detail/:id", menu.getMenuDetailByMenuId);

// Serving Type
route.get("/serving-type", servingType.getServingType);

// Discount Kasir
route.get("/discount", discount.getDiscounts);

// Cart
route.get("/cart", cart.getCart);
route.post("/cart", cart.createCart);
route.delete("/cart", cart.deleteCart);
route.get("/cart/:id", cart.getCartItems);
route.patch("/cart/:id", cart.updateCart);
route.delete("/cart/:id", cart.deleteCartItems);

// Transaction
route.get("/transaction", transaction.getTransactions);
route.post("/transaction", transaction.createTransaction);
route.get("/transaction/:id", transaction.getTransactionById);
route.post("/discount-transaction", transaction.createDiscountTransaction);

// Refund
route.post("/refund", refund.createRefund);

// Struct
route.get("/struct-customer-transaction/:id", struct.getCustomerStruct);
route.get("/struct-kitchen/:id", struct.getKitchenStruct);

// Report 
route.get("/report", report.getReport);
route.get("/payment-report", report.getPaymentReport);

// Installment Cart
route.get("/installment-cart", installmentCart.getInstallmentCart);
route.post("/installment-cart", installmentCart.createInstallmentCart);
route.get("/installment-cart/:id", installmentCart.getInstallmentCartByCartId);

// Authentication
route.post("/check-pin", outlet.checkPin);
route.post("/login", authentication.login);

// Users Management
route.get("/user-management", user.getUsers);
route.post("/user-management", user.create);
route.get("/user-management/:id", user.getUserById);
route.patch("/user-management/:id", user.update);
route.delete("/user-management/:id", user.delete);

// Outlet Management
route.get("/outlet", outlet.getOutlets);
route.post("/outlet", outlet.create);
route.get("/outlet/:id", outlet.getOutletById);
route.patch("/outlet/:id", outlet.update);
route.delete("/outlet/:id", outlet.delete);

// Discount CMS
route.get("/v2/discount", discount.getDiscountsV2);
route.post("/discount", discount.create);
route.get("/discount/:id", discount.getDiscountById);
route.patch("/discount/:id", discount.update);
route.delete("/discount/:id", discount.delete);

// Profile
route.patch("/profile/:id", profile.updateProfile);

// Custom Menu Price
route.get("/custom-menu-price/:id", customPrice.getCustomizePriceByMenuId);
route.patch("/custom-menu-price/:id", customPrice.updateCustomizePrice);

module.exports = route;
