// repositories/InventoryRepository.js
const db = require('../config/db'); 

class InventoryRepository {

    /**
     * Retrieves the recipe (ingredients and quantities) for a given menu item ID.
     * @param {number} menuItemId - The ID of the menu item.
     * @param {knex.Transaction | knex} dbInstance - Knex instance or transaction object (trx).
     * @returns {Promise<Array>} - List of recipe parts: [{ inv_item_id: number, quantity_used: number }]
     */
    static async getRecipeForMenuItem(menuItemId, dbInstance = db) {
        // Uses confirmed table name 'recipes' and column names 'menu_item_id', 'inv_item_id', 'quantity_used'.
        // Alias is used to ensure consistency in the service layer's object structure.
        return dbInstance('recipes') 
            .select('inv_item_id', 'quantity_used') 
            .where({ menu_item_id: menuItemId });
    }

    /**
     * Attempts to deduct a specific quantity of an inventory item.
     * Uses a condition to ensure stock does not go below zero (or below the required quantity).
     * @param {number} invItemId - The ID of the inventory item (ingredient).
     * @param {number} quantity - The amount to deduct.
     * @param {knex.Transaction} trx - The transaction object.
     * @returns {Promise<number>} - Number of affected rows (should be 1 on success, 0 on stock failure).
     */
    static async deductStock(invItemId, quantity, trx) {
        // Uses confirmed table name 'inventory_items' and column names 'inv_item_id' and 'current_stock'.
        // The where clause 'current_stock >= quantity' ensures that we only update if there is enough stock.
        return trx('inventory_items')
            .where('inv_item_id', invItemId)
            .andWhere('current_stock', '>=', quantity)
            .update({
                current_stock: trx.raw('current_stock - ?', [quantity])
            });
    }
}

module.exports = InventoryRepository;