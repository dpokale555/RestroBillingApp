const express = require('express');
const router = express.Router();

// CORRECTED IMPORT: Capital 'T' to match the file name 'TableController.js'
const TableController = require('../controllers/TableController'); 

// GET all tables
router.get('/', TableController.getAllTables);

// GET a single table by ID
router.get('/:id', TableController.getTableById);

// POST a new table
router.post('/', TableController.createTable);

// PUT update an existing table
router.put('/:id', TableController.updateTable);

// DELETE a table
router.delete('/:id', TableController.deleteTable);

module.exports = router;