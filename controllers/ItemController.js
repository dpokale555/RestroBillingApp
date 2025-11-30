// Assuming db is the Knex connection instance initialized in config/db.js
const db = require('../config/db'); 

// FIX 1: Corrected table name based on schema screenshot: 'menuitems'
const MENU_ITEMS_TABLE = 'menuitems';

// Temporary map to convert Category Name (from UI) to Category ID (for DB)
// NOTE: In a real application, you should query a separate 'categories' table to get this ID.
const CATEGORY_MAP = {
    'Appetizer': 1,
    'Main Course': 2,
    'Dessert': 3,
    'Beverage': 4,
    // Add all categories used by your UI here!
};

/**
 * Controller for handling Menu Item CRUD operations.
 * Assumes a database table named 'menuitems' with fields:
 * item_id (PK), name, price, category_id, is_available
 */

// READ: Fetch all menu items
exports.getAllItems = async (req, res) => {
    try {
        const items = await db(MENU_ITEMS_TABLE).select('*');
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Failed to retrieve menu items from the database.' });
    }
};

// CREATE: Add a new menu item
exports.createItem = async (req, res) => {
    // FIX 3: Extract category and is_available fields, which are mandatory for the insert
    const { name, price, category, is_available } = req.body;
    
    // Simple validation
    if (!name || typeof price === 'undefined' || price <= 0 || !category) {
        return res.status(400).json({ message: 'Name, Price, and Category are required.' });
    }

    // FIX 2: Convert category name (string) to ID (int)
    const category_id = CATEGORY_MAP[category];

    if (!category_id) {
        return res.status(400).json({ message: `Invalid category name: ${category}. Please check category map.` });
    }

    // Default status if not provided (though your schema has a default, good to pass explicitly)
    const status = typeof is_available === 'undefined' ? 1 : is_available;

    try {
        const [newId] = await db(MENU_ITEMS_TABLE).insert({
            name,
            // Removed 'description', 'created_at', 'updated_at' as they are not in the schema
            price: parseFloat(price).toFixed(2), 
            category_id: category_id, // This is the required foreign key
            is_available: status, // This corresponds to the 'Status' in your UI
        });

        res.status(201).json({ 
            message: 'Menu item created successfully.', 
            item_id: newId // FIX 5: Use the correct primary key name 'item_id'
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        // This error will now likely be due to a unique constraint violation on 'name' if you try inserting the same item twice.
        res.status(500).json({ message: 'Failed to create menu item in the database. (Check server logs for constraint violations).' });
    }
};

// UPDATE: Modify an existing menu item by ID
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    // Update destructuring to include all updatable fields as per schema
    const { name, price, category, is_available } = req.body;
    
    // FIX: Added ID validation
    if (!id || id === 'undefined') { 
        console.error('Update attempt failed: Menu Item ID is missing or invalid.');
        return res.status(400).json({ message: 'Menu Item ID is missing or invalid in the URL.' });
    }

    // Simple validation
    if (!name || typeof price === 'undefined' || price <= 0) {
        return res.status(400).json({ message: 'Name and a valid positive Price are required for update.' });
    }

    // Perform category conversion for update if category is present in body
    let updatePayload = { name, price: parseFloat(price).toFixed(2) };
    if (typeof is_available !== 'undefined') {
        updatePayload.is_available = is_available;
    }

    if (category) {
        const category_id = CATEGORY_MAP[category];
        if (!category_id) {
            return res.status(400).json({ message: `Invalid category name: ${category}.` });
        }
        updatePayload.category_id = category_id;
    }
    
    try {
        const updatedCount = await db(MENU_ITEMS_TABLE)
            // Use the correct primary key name 'item_id'
            .where({ item_id: id })
            .update(updatePayload);

        if (updatedCount === 0) {
            return res.status(404).json({ message: `Menu item with ID ${id} not found.` });
        }

        res.status(200).json({ message: 'Menu item updated successfully.' });
    } catch (error) {
        console.error(`Error updating menu item ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to update menu item in the database.' });
    }
};

// DELETE: Remove a menu item by ID
exports.deleteItem = async (req, res) => {
    const { id } = req.params;

    // FIX: Added ID validation
    if (!id || id === 'undefined') {
        console.error('Delete attempt failed: Menu Item ID is missing or invalid.');
        return res.status(400).json({ message: 'Menu Item ID is missing or invalid in the URL.' });
    }

    try {
        const deletedCount = await db(MENU_ITEMS_TABLE)
            // Use the correct primary key name 'item_id'
            .where({ item_id: id })
            .del();

        if (deletedCount === 0) {
            return res.status(404).json({ message: `Menu item with ID ${id} not found.` });
        }

        res.status(200).json({ message: 'Menu item deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting menu item ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete menu item from the database.' });
    }
};