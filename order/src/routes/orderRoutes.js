const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();
const orderController = new OrderController();

router.post('/', orderController.createOrder);

module.exports = router;
