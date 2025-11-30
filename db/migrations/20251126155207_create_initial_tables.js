// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.up = function(knex) {
  
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
  
// };


// db/migrations/TIMESTAMP_create_initial_tables.js

exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.increments('id').primary(); 
    table.string('name', 255).notNullable(); 
    table.decimal('price', 10, 2).notNullable(); 
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
