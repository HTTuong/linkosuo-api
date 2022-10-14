const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/is-auth');
const orderController = require('../controller/order');

router.post('/random-order', orderController.handleUnknownUserOrder);

router.post('/order', isAuthenticated, orderController.handleUserOrder);

router.get('/order', isAuthenticated, orderController.getOrders);

module.exports = router;
