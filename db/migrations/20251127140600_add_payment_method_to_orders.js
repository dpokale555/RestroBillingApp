// YYYYMMDDHHMMSS_add_payment_method_to_orders.js (Filename will vary)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    // Add the new 'payment_method' column to the 'orders' table
    return knex.schema.alterTable('orders', function(table) {
        // Add a string column to store payment method (e.g., 'Cash', 'Card')
        // It is nullable because an order is placed (Pending) before it is paid.
        table.string('payment_method', 50).nullable(); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    // Drop the column if we need to rollback the migration
    return knex.schema.alterTable('orders', function(table) {
        table.dropColumn('payment_method');
    });
};