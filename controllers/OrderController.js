// controllers/OrderController.js

const OrderService = require('../services/OrderService');
// NOTE: We keep the main Knex instance imported only because the temporary
// getOrderDetails method still uses direct database queries.
const knex = require('../config/db'); 

class OrderController {
    
    // --- 1. POST /orders: Place New Order (Uses Service Layer) ---
    static async placeOrder(req, res) { 
        // Data from the request body
        const { 
            table_id, 
            waiter_id, 
            total_tax, 
            total_discount, 
            status,
            items
        } = req.body;
        
        // Comprehensive validation check for core data
        if (!table_id || !waiter_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields (table_id, waiter_id) or missing order items array.' 
            });
        }
        
        // Validate required item fields
        const invalidItem = items.find(item => 
            !item.menu_item_id || item.quantity === undefined || item.unit_price_at_sale === undefined
        );

        if (invalidItem) {
             return res.status(400).json({ 
                error: 'Each item must have a menu_item_id, quantity, and unit_price_at_sale.' 
            });
        }
        
        // Prepare the data structure expected by OrderService.placeOrder
        const newOrderData = { table_id, waiter_id, total_tax, total_discount, status };
        
        try {
            // CALL THE SERVICE LAYER
            const result = await OrderService.placeOrder(newOrderData, items);
            
            // 201 Created status
            return res.status(201).json(result); 

        } catch (error) {
            console.error('Error placing order:', error.message, error.stack);
            return res.status(500).json({ 
                error: 'Failed to place new order.', 
                details: error.message 
            });
        }
    }
    
    // --- 2. GET /orders/:order_id: Fetch Order Details (Temporary Knex Logic) ---
    static async getOrderDetails(req, res) {
        const orderId = req.params.order_id;
        
        try {
            // NOTE: This logic should ideally be moved to OrderService/OrderRepository.
            const results = await knex('orders')
                .leftJoin('orderitems', 'orderitems.order_id', 'orders.order_id')
                .where('orders.order_id', orderId)
                .select(
                    'orders.order_id as order_id',
                    'orders.final_amount as total',
                    'orders.order_date as created_at',
                    'orders.status as status',
                    'orderitems.order_item_id as item_id',
                    'orderitems.menu_item_id',
                    'orderitems.quantity',
                    'orderitems.unit_price_at_sale as price_at_time'
                )
                .orderBy('orderitems.order_item_id');
                
            if (results.length === 0) {
                return res.status(404).json({ error: `Order with ID ${orderId} not found.` });
            }

            // Process the flat result set into a structured object
            const orderDetails = {
                id: results[0].order_id,
                total: results[0].total,
                status: results[0].status,
                created_at: results[0].created_at,
                items: results.map(row => ({
                    id: row.item_id,
                    menu_item_id: row.menu_item_id,
                    quantity: row.quantity,
                    price_at_time: row.price_at_time
                })).filter(item => item.id !== null)
            };

            return res.json(orderDetails);
        } catch (error) {
            console.error(`Error fetching details for order ID ${orderId}:`, error);
            return res.status(500).json({ 
                error: 'Failed to fetch order details.',
                details: error.message 
            });
        }
    }


    // --- 3. POST /orders/:orderId/complete: Inventory Deduction Logic (Uses Service Layer) ---
    static async completeOrder(req, res) {
        const orderId = req.params.orderId;

        try {
            // CALL THE SERVICE LAYER
            const result = await OrderService.completeOrder(orderId);
            
            return res.status(200).json(result);
            
        } catch (error) {
            
            // 409 Conflict for Insufficient Stock
            if (error.message.includes('Insufficient stock')) {
                return res.status(409).json({ success: false, message: error.message });
            }
            
            // 404 Not Found for missing orders
            if (error.message.includes('not found or contains no items')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            
            console.error('Error completing order:', error.message);
            return res.status(500).json({ success: false, message: 'Internal Server Error: Could not process order completion.' });
        }
    }
    
    // --- 4. POST /orders/:orderId/pay: Payment and Billing Logic (Uses Service Layer) ---
    static async processPayment(req, res) {
        const orderId = req.params.orderId;
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method is required.' });
        }

        try {
            // CALL THE SERVICE LAYER
            const result = await OrderService.processPayment(orderId, paymentMethod);
            
            // 200 OK status, returning the bill details
            return res.status(200).json(result);
            
        } catch (error) {
            console.error('Error processing payment:', error.message);
            
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            
            return res.status(500).json({ success: false, message: 'Internal Server Error: Could not process payment.' });
        }
    }
}

module.exports = OrderController;