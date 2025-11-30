// routes/orderRouter.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController'); 

// 1. POST /orders: Create new order
// NOTE: Assuming your controller method is called 'createOrder'.
router.post('/', OrderController.placeOrder); 

// 2. POST /orders/:orderId/complete: Route for Inventory Deduction (changes status to 'Completed')
router.post('/:orderId/complete', OrderController.completeOrder);

// 3. POST /orders/:orderId/pay: NEW ROUTE for Payment and Billing (changes status to 'Paid')
router.post('/:orderId/pay', OrderController.processPayment);

// 4. GET /orders/:order_id: Fetch order details
router.get('/:orderId', OrderController.getOrderDetails); 

module.exports = router;