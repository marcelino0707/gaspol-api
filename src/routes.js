const express = require("express");
const route = express.Router();

// Path Controllers
const outlet = require("./controllers/outletController");
const product = require("./controllers/productController");
const menu = require("./controllers/menuController");
const transaction = require("./controllers/transactionController");
const servingType = require("./controllers/servingTypeController");
const discount = require("./controllers/discountController");
const refund = require("./controllers/refundController");
const cart = require("./controllers/cartController");

// Outlet
route.get("/outlet", outlet.getOutlets);

// Product
route.get("/product", product.getProducts);
route.post("/product", product.createProduct);
route.get("/product/:id", product.getProductById);
route.patch("/product/:id", product.updateProduct);
route.delete("/product/:id", product.deleteProduct);

// Menu
route.get("/menu", menu.getMenus);
route.post("/menu", menu.createMenu);
route.get("/menu/:id", menu.getMenuById);
route.patch("/menu/:id", menu.updateMenu);
route.delete("/menu/:id", menu.deleteMenu);

// Menu Detail For Cart
route.get("/menu-detail/:id", menu.getMenuDetailByMenuId);

// Serving Type
route.get("/serving-type", servingType.getServingType);

// Discount
route.get("/discount", discount.getDiscounts);

// Cart
route.get("/cart", cart.getCart);
route.post("/cart", cart.createCart);
// route.patch("/cart", cart.updateCart);
route.delete("/cart", cart.deleteCart);
route.get("/cart/:id", cart.getCartItems);
route.patch("/cart/:id", cart.updateCart);
// route.delete("/cart/:id", cart.deleteCartItems);


// Transaction
route.get("/transaction", transaction.getTransactions);
route.post("/transaction", transaction.createTransaction);
route.get("/transaction/:id", transaction.getTransactionById);
route.patch("/transaction/:id", transaction.updateTransaction);
route.delete("/transaction/:id", transaction.deleteTransaction);

// Refund
route.post("/refund/:id", refund.createRefund);

module.exports = route;
