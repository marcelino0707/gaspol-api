const express = require('express');
const route = express.Router();

// Path Controllers
const outlet = require('./controllers/outletController');
const product = require('./controllers/productController');

// Outlet
route.get('/outlet', outlet.getOutlets);

// Product
route.get('/product', product.getProducts);
route.post('/product', product.createProduct);
route.get('/product/:id', product.getProductById);
route.patch('/product/:id', product.updateProduct);
route.delete('/product/:id', product.deleteProduct);

module.exports = route;