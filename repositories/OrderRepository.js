// repositories/OrderRepository.js
const db = require('../config/db'); 

class OrderRepository {
    
    /**
     * Creates a new order entry. 
     * IMPORTANT: This method returns the Knex query builder, NOT the awaited result.
     * @param {object} orderData - Data for the new order (table_id, waiter_id, final_amount, etc.).
     * @returns {knex.QueryBuilder} - Unexecuted Knex query builder for insertion.
     */
    static createOrder(orderData) {
        return db('orders')
            .insert({
                status: orderData.status || 'Pending', // Use provided status or default
                ...orderData,
            }, ['order_id']); // Return order_id column for retrieval in the service layer
    }

    /**
     * Inserts multiple items into the 'orderitems' table.
     * IMPORTANT: This method returns the Knex query builder, NOT the awaited result.
     * @param {number} orderId - The ID of the parent order.
     * @param {Array<object>} items - Array of items.
     * @returns {knex.QueryBuilder} - Unexecuted Knex query builder for insertion.
     */
    static createOrderItems(orderId, items) {
        // Map items to include the foreign key (order_id)
        const orderItems = items.map(item => ({
            order_id: orderId,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            unit_price_at_sale: item.unit_price_at_sale
        }));

        return db('orderitems').insert(orderItems);
    }
    
    /**
     * Retrieves all items and quantities sold for a specific order.
     * @param {number} orderId - The ID of the order.
     * @param {knex.Transaction | knex} dbInstance - Knex instance or transaction object (trx).
     * @returns {Promise<Array>} - List of objects: [{ menu_item_id: number, quantity: number }]
     */
    static async getOrderItems(orderId, dbInstance = db) {
        const numericOrderId = parseInt(orderId, 10);
        
        if (isNaN(numericOrderId)) {
            throw new Error(`Invalid order ID format: ${orderId}`);
        }

        return dbInstance('orderitems') 
            .select('menu_item_id', 'quantity') 
            .where({ order_id: numericOrderId }); 
    }

    /**
     * Updates the status of an order, and optionally records payment details.
     * @param {number} orderId - The ID of the order.
     * @param {string} status - The new status (e.g., 'Paid').
     * @param {knex.Transaction} trx - The transaction object.
     * @param {string} [paymentMethod] - Optional payment method (e.g., 'Cash', 'Card').
     * @returns {Promise<number>} - Number of rows affected.
     */
    static async updateOrderStatus(orderId, status, trx, paymentMethod = null) {
        const numericOrderId = parseInt(orderId, 10);
        
        const updateData = {
            status: status
        };

        // Conditionally add payment method if provided and status is 'Paid' or similar
        if (paymentMethod && status === 'Paid') {
            // NOTE: This assumes your 'orders' table has a 'payment_method' column.
            updateData.payment_method = paymentMethod;
        }

        return trx('orders')
            .where({ order_id: numericOrderId })
            .update(updateData);
    }
    
    /**
     * Retrieves all necessary details for generating a customer bill/invoice.
     * @param {number} orderId - The ID of the order.
     * @returns {Promise<object>} - Order details including items.
     */
    static async getFinalOrderDetailsForBilling(orderId) {
        const numericOrderId = parseInt(orderId, 10);

        // Fetch order header details
        const orderHeader = await db('orders')
            .select('order_id', 'final_amount', 'total_tax', 'total_discount', 'order_date', 'status', 'table_id')
            .where({ order_id: numericOrderId })
            .first();

        if (!orderHeader) {
            return null;
        }

        // Fetch order items along with the menu item name (assuming a 'name' column in 'menu_items')
        const items = await db('orderitems')
            .select(
                'orderitems.quantity', 
                'orderitems.unit_price_at_sale', 
                'menu_items.name as menu_item_name' // Assumes a menu_items table is joinable
            )
            .leftJoin('menu_items', 'orderitems.menu_item_id', 'menu_items.menu_item_id')
            .where('orderitems.order_id', numericOrderId);

        return {
            ...orderHeader,
            items: items
        };
    }
}

module.exports = OrderRepository;