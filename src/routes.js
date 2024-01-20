const express = require("express");
const route = express.Router();
const multer = require("multer");
const upload = multer();

// Path Controllers
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
const paymentType = require("./controllers/paymentController");
const expenditure = require("./controllers/expenditureController");
const ingredient = require("./controllers/ingredientController");
const ingredeintOrderList = require("./controllers/ingredientOrderController");

// Menu
route.get("/menu", menu.getMenus); // Kasir
route.get("/menu/:id", menu.getMenuById); // Kasir
route.delete("/menu/:id", menu.deleteMenu); // Kasir

// Menu v2
route.get("/v2/menu", menu.getMenusV2); // CMS
route.post("/v2/menu", upload.single('image'), menu.createMenuV2); // CMS
route.get("/v2/menu/:id", menu.getMenuByIdV2); // CMS
route.patch("/v2/menu/:id", upload.single('image'), menu.updateMenuV2); // CMS

// Menu Detail For Cart
route.get("/menu-detail/:id", menu.getMenuDetailByMenuId); // Kasir

// Serving Type
route.get("/serving-type", servingType.getServingType); // CMS 
route.post("/serving-type", servingType.createServingType); // CMS
route.get("/serving-type/:id", servingType.getServingTypeById); // CMS
route.patch("/serving-type/:id", servingType.updateServingType); // CMS
route.delete("/serving-type/:id", servingType.delete); // CMS

// Payment Type
route.get("/payment-type", paymentType.getPaymentType); // Kasir 
route.get("/payment-management", paymentType.getPaymentTypesCMS); // CMS
route.post("/payment-management", paymentType.create); // CMS
route.get("/payment-management/:id", paymentType.getPaymentTypesById); // CMS
route.patch("/payment-management/:id", paymentType.update); // CMS
route.delete("/payment-management/:id", paymentType.delete); // CMS

// Discount Kasir
route.get("/discount", discount.getDiscounts); // Kasir

// Cart
route.get("/cart", cart.getCart); // Kasir
route.post("/cart", cart.createCart); // Kasir
route.post("/delete-cart", cart.deleteCart); // Kasir
route.get("/cart/:id", cart.getCartItems); // Kasir by cart_detail_id
route.patch("/cart/:id", cart.updateCart); // Kasir by cart_detail_id
route.delete("/cart/:id", cart.deleteCartItems); // Kasir

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
route.get("/struct-shift", struct.getLastShiftStruct);
route.post("/struct-shift", struct.getShiftStruct);

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
route.get("/outlet", outlet.getOutlets); // CMS 
route.post("/outlet", outlet.create); // CMS
route.get("/outlet/:id", outlet.getOutletById); // CMS
route.patch("/outlet/:id", outlet.update); // CMS
route.delete("/outlet/:id", outlet.delete); // CMS

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

// Expenditure
route.post("/expenditure", expenditure.createExpense);

// Split Cart
route.post("/split-cart", cart.splitCart);

// Ingredient
route.get("/ingredient", ingredient.getIngredients); // CMS 
route.post("/ingredient", ingredient.createIngredient); // CMS
route.get("/ingredient/:id", ingredient.getIngredientById); // CMS
route.patch("/ingredient/:id", ingredient.updateIngredient); // CMS
route.delete("/ingredient/:id", ingredient.deleteIngredient); // CMS

// ingredeintOrderList
route.get("/ingredient-order", ingredeintOrderList.getOrderIngredients); // CMS 
route.patch("/ingredient-order", ingredeintOrderList.updateOrderIngredients); // CMS
route.get("/ingredient-order-outlet", ingredeintOrderList.getOrderIngredientsOutlet); // CMS
route.get("/ingredient-report", ingredeintOrderList.getOrderIngredientsReport); // CMS

module.exports = route;
