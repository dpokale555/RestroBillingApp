// config/db.js

const knex = require('knex');
const knexfile = require('../knexfile'); // Load your configuration
const environment = process.env.NODE_ENV || 'development'; // Default to 'development'
const config = knexfile[environment]; // Get the settings for the current environment

// Initialize and export the Knex connection instance
const db = knex(config);

module.exports = db;


