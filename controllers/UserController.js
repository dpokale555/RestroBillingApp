const UserRepository = require('../repositories/UserRepository'); // Import the User Repository
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

const saltRounds = 10; // Standard practice for bcrypt salt generation

/**
 * Retrieves all users from the database.
 */
exports.getAllUsers = async (req, res) => {
    try {
        // Use the Repository to fetch users, ensuring the 'password' field is not selected
        const users = await UserRepository.findAll();
            
        console.log("Users successfully fetched.");
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
};

/**
 * Creates a new user.
 */
exports.createUser = async (req, res) => {
    // Frontend sends 'password_hash' as the field name for the raw password.
    const { username, first_name, last_name, role, password_hash: rawPassword } = req.body; 
    
    // Input validation
    if (!username || !first_name || !last_name || !role || !rawPassword) {
        return res.status(400).json({ message: 'Username, first name, last name, role, and password are required.' });
    }

    try {
        // 1. Check for existing username
        const existingUser = await UserRepository.findByCondition({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }

        // 2. Hash the raw password
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

        // 3. Prepare data for insertion
        const userData = {
            username,
            first_name,
            last_name,
            role,
            password_hash: hashedPassword, // Store the HASHED password in the 'password' column
        };

        // 4. Create the user (Repository handles returning the public fields)
        const newUser = await UserRepository.create(userData);

        res.status(201).json(newUser);

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

/**
 * Updates an existing user by ID.
 */
exports.updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    // Frontend sends 'password_hash' as the field name for the new raw password.
    const { username, first_name, last_name, role, password_hash: newRawPassword } = req.body; 
    
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }
    if (!username || !first_name || !last_name || !role) {
         return res.status(400).json({ message: 'Username, first name, last name, and role are required for update.' });
    }

    try {
        let userUpdates = { username, first_name, last_name, role };

        // 1. Check if a new password was provided and hash it
        if (newRawPassword) {
            userUpdates.password = await bcrypt.hash(newRawPassword, saltRounds);
            console.log(`User ${id} password updated.`);
        }

        // 2. Check for existing username only if it's changing and belongs to another user
        const existingUserWithUsername = await UserRepository.findByCondition({ username });
        if (existingUserWithUsername && existingUserWithUsername.user_id !== id) {
             return res.status(409).json({ message: 'Username is already taken.' });
        }
        
        // 3. Update the user
        const updatedUser = await UserRepository.update(id, userUpdates);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or no change made.' });
        }
        
        // Updated user object (which excludes the password) is returned directly by the repository's method
        res.status(200).json(updatedUser);
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

/**
 * Deletes a user by ID.
 */
exports.deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }
    
    try {
        // Use the Repository to delete the user
        const affectedRows = await UserRepository.delete(id);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found for deletion.' });
        }
        
        // 204 No Content is standard for successful deletion
        res.status(204).send(); 
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};