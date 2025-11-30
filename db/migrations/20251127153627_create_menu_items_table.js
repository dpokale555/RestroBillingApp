/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('menu_items', (table) => {
        table.increments('menu_item_id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.decimal('price', 10, 2).notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('menu_items');
};