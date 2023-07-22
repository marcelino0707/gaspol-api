const express = require("express");
const route = express.Router();

// Path Controllers
const outlet = require("./controllers/outletController");
const product = require("./controllers/productController");
const menu = require("./controllers/menuController");
const transaction = require("./controllers/transactionController");
const servingType = require("./controllers/servingTypeController");

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

// Serving Type
route.get("/serving-type", servingType.getServingType);

// Transaction
route.get("/transaction", transaction.getTransactions);
route.post("/transaction", transaction.createTransaction);
route.get("/transaction/:id", transaction.getTransactionById);

module.exports = route;
