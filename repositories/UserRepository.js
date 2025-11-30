const db = require('../config/db'); // Your Knex configuration

/**
 * Columns to select for public display/API responses, excluding sensitive data like password.
 * Assumes the password column is simply named 'password' in the database.
 * @type {Array<string>}
 */
const PUBLIC_USER_FIELDS = [
    'user_id',
    'username',
    'first_name',
    'last_name',
    'role',
];

/**
 * UserRepository handles all database interactions for the 'users' entity.
 * Assumes a 'users' table with columns: user_id (PK), username (UNIQUE), first_name, last_name, role, password (hashed).
 */
class UserRepository {
    constructor() {
        this.table = 'users';
    }

    /**
     * Retrieves all users.
     * @returns {Promise<Array>} A list of all user objects with public fields.
     */
    async findAll() {
        return db(this.table).select(PUBLIC_USER_FIELDS).orderBy('user_id');
    }

    /**
     * Retrieves a single user by ID.
     * @param {number} id - The user_id.
     * @returns {Promise<Object|undefined>} The user object (public fields) or undefined if not found.
     */
    async findById(id) {
        return db(this.table).where({ user_id: id }).select(PUBLIC_USER_FIELDS).first();
    }
    
    /**
     * Retrieves a single user by an arbitrary condition.
     * Used for checking unique constraints (like username). Returns public fields.
     * @param {Object} condition - An object containing key-value pairs for the WHERE clause (e.g., { username: 'testuser' }).
     * @returns {Promise<Object|undefined>} The user object (public fields) or undefined if not found.
     */
    async findByCondition(condition) {
        // Find by username, but return public fields (which excludes password)
        return db(this.table).where(condition).select(PUBLIC_USER_FIELDS).first();
    }

    /**
     * Creates a new user record.
     * @param {Object} userData - Data for the new user (username, first_name, last_name, role, HASHED password).
     * @returns {Promise<Object>} The created user object (public fields) including its ID.
     */
    async create(userData) {
        // userData must contain the HASHED password here.
        // Knex returns an array of IDs for the inserted rows.
        const [id] = await db(this.table).insert(userData);
        
        // Fetch the created record to return the full public object
        return this.findById(id); 
    }

    /**
     * Updates an existing user record.
     * @param {number} id - The user_id to update.
     * @param {Object} userData - Data to update (e.g., username, role, password(hashed), or any subset).
     * @returns {Promise<Object|undefined>} The updated user object (public fields) or undefined if not found.
     */
    async update(id, userData) {
        const rowsAffected = await db(this.table)
            .where({ user_id: id })
            .update(userData);
        
        // If rowsAffected is 0, the record wasn't found/updated
        if (rowsAffected === 0) return undefined;
        
        // Return the updated public record
        return this.findById(id); 
    }

    /**
     * Deletes a user record.
     * @param {number} id - The user_id to delete.
     * @returns {Promise<number>} Number of rows deleted (1 or 0).
     */
    async delete(id) {
        return db(this.table).where({ user_id: id }).del();
    }
}

module.exports = new UserRepository();