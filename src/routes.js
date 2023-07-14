const express = require('express');
const route = express.Router();

// Path Controllers
const outlet = require('./controllers/outletController');
const product = require('./controllers/productController');

// Outlet
route.get('/outlet', outlet.getOutlets);

// Product
route.get('/product', product.getProducts);

module.exports = route;