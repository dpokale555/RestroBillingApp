const express = require('express');
const router = express.Router();
// CORRECTED PATH for common Express structure: Go up (..) from 'routes/', then down into 'controllers/'
const userController = require('../controllers/UserController.js'); 

// GET /users - Retrieve all users
router.get('/', userController.getAllUsers);

// POST /users - Create a new user
router.post('/', userController.createUser);

// PUT /users/:id - Update a user by ID
router.put('/:id', userController.updateUser);

// DELETE /users/:id - Delete a user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;