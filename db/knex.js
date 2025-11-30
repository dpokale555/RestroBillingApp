// db/knex.js

// Determine the environment (defaults to 'development')
const environment = process.env.NODE_ENV || 'development';

// Load the configuration from the knexfile.js, using the correct environment block
const config = require('../knexfile')[environment];

// Initialize the Knex connection
const knex = require('knex')(config);

// Export the connection instance for use in Express
module.exports = knex;