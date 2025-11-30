// services/OrderService.js

const OrderRepository = require('../repositories/OrderRepository');
const InventoryRepository = require('../repositories/InventoryRepository');
const db = require('../config/db'); // Knex instance for transactions

class OrderService {
    
    /**
     * Creates a new order and associated order items transactionally.
     * @param {object} newOrderData - Contains order metadata (table_id, waiter_id, total_tax, total_discount)
     * @param {Array<object>} items - Array of items: [{ menu_item_id: number, quantity: number, unit_price_at_sale: number }]
     * @returns {Promise<object>} - The newly created order ID and success status.
     * @throws {Error} - Throws an error on failure, triggering rollback.
     */
    static async placeOrder(newOrderData, items) {
        
        // 1. Calculate the final amount 
        const finalAmount = items.reduce((total, item) => {
            return total + (item.quantity * item.unit_price_at_sale);
        }, 0);

        // 2. Start a transaction to ensure atomicity
        return db.transaction(async (trx) => {
            
            const orderData = {
                ...newOrderData,
                final_amount: finalAmount,
            };
            
            // --- 3. Create the Parent Order ---
            const result = await OrderRepository.createOrder(orderData).transacting(trx); 
            const orderId = result[0]?.order_id || result[0];

            if (!orderId) {
                throw new Error("Failed to retrieve new order ID after insertion.");
            }

            // --- 4. Create the Order Items ---
            await OrderRepository.createOrderItems(orderId, items).transacting(trx);

            return { 
                success: true, 
                message: `Order ${orderId} placed successfully.`,
                orderId: orderId
            };

        }).catch(error => {
            console.error('OrderService Place Order Transaction Failed:', error.message, error.stack);
            throw error; 
        });
    }

    /**
     * Completes an order by deducting all required inventory items transactionally.
     * NOTE: This function focuses purely on physical order fulfillment and inventory deduction.
     * The status is set to 'Completed' (ready for payment).
     * @param {number} orderId - The ID of the order being completed.
     * @returns {Promise<object>} - Success status and message.
     * @throws {Error} - Throws an error on insufficient stock or other failures, triggering rollback.
     */
    static async completeOrder(orderId) {
        
        return db.transaction(async (trx) => {
            
            // 1. Get Order Items
            const orderItems = await OrderRepository.getOrderItems(orderId, trx);
            
            if (!orderItems || orderItems.length === 0) {
                throw new Error(`Order ID ${orderId} not found or contains no items.`); 
            }

            // 2. Deduction Loop (InventoryRepository logic)
            for (const item of orderItems) {
                const quantitySold = item.quantity; 
                const recipe = await InventoryRepository.getRecipeForMenuItem(item.menu_item_id, trx);
                
                if (!recipe || recipe.length === 0) {
                     throw new Error(`Recipe not found for menu_item_id ${item.menu_item_id}. Cannot deduct inventory.`);
                }

                for (const ingredient of recipe) {
                    const totalDeduction = ingredient.quantity_used * quantitySold;
                    const affectedRows = await InventoryRepository.deductStock(ingredient.inv_item_id, totalDeduction, trx);

                    if (affectedRows === 0) {
                        const errorMsg = `Insufficient stock for ingredient ID ${ingredient.inv_item_id}. Required: ${totalDeduction}. Order ${orderId} cancelled.`;
                        throw new Error(`Transaction failed: ${errorMsg}`); 
                    }
                }
            }

            // 3. Update Status to Completed (Ready for payment)
            await OrderRepository.updateOrderStatus(orderId, 'Completed', trx); 
            
            return { success: true, message: `Order ${orderId} completed and inventory deducted.` };

        }).catch(error => {
            console.error('OrderService Complete Order Transaction Failed:', error.message, error.stack);
            throw error; 
        });
    }

    /**
     * Processes payment for a completed order, updates status to 'Paid', and retrieves bill details.
     * @param {number} orderId - The ID of the order.
     * @param {string} paymentMethod - The method of payment (e.g., 'Card', 'Cash').
     * @returns {Promise<object>} - The final billing information.
     * @throws {Error} - Throws an error if the order is not found or cannot be paid.
     */
    static async processPayment(orderId, paymentMethod) {
        if (!paymentMethod) {
            throw new Error("Payment method is required.");
        }

        // Use a transaction just to ensure the status update and payment method recording are atomic
        await db.transaction(async (trx) => {
             // Update status to 'Paid' and record the payment method
            const updatedRows = await OrderRepository.updateOrderStatus(orderId, 'Paid', trx, paymentMethod);
            
            if (updatedRows === 0) {
                 throw new Error(`Order ID ${orderId} not found or unable to update status to Paid.`);
            }
        });

        // Fetch the final bill details using the new repository method
        const billingDetails = await OrderRepository.getFinalOrderDetailsForBilling(orderId);

        if (!billingDetails) {
            throw new Error(`Could not retrieve billing details for order ${orderId}.`);
        }
        
        return { 
            success: true, 
            message: `Order ${orderId} successfully paid via ${paymentMethod}.`, 
            bill: billingDetails 
        };
    }
}

module.exports = OrderService;