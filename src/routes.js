const express = require('express')
const route = express.Router()

// Path Controllers
const outlet = require('./controllers/outletController')

// Outlet
route.get('/outlet', outlet.getOutlets)

module.exports = route