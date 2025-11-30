const express = require('express');
const ItemController = require('../controllers/ItemController');

const router = express.Router();

// Route for fetching all items (GET /items)
router.get('/', ItemController.getAllItems);

// Route for creating a new item (POST /items)
router.post('/', ItemController.createItem);

// Route for updating an item by ID (PUT /items/:id)
router.put('/:id', ItemController.updateItem);

// Route for deleting an item by ID (DELETE /items/:id)
router.delete('/:id', ItemController.deleteItem);

module.exports = router;