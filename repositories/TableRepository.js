const db = require('../config/db'); // Your Knex configuration

/**
 * TableRepository handles all database interactions for the 'tables' entity.
 * Assumes a 'tables' table with columns: 
 * table_id (PK, AUTO_INCREMENT), name (UNIQUE), status (DEFAULT 'Free').
 */



class TableRepository {
    constructor() {
        this.table = 'tables'; // Ensure this matches your actual MySQL table name (case-sensitive on some systems)
    }

    /**
     * Retrieves all tables.
     * @returns {Promise<Array>} A list of all table objects.
     */
    async findAll() {
        return db(this.table).select('*');
    }

    /**
     * Retrieves a single table by ID.
     * @param {number} id - The table_id.
     * @returns {Promise<Object|undefined>} The table object or undefined if not found.
     */
    async findById(id) {
        // Use table_id as per your database schema
        return db(this.table).where({ table_id: id }).first();
    }
    
    /**
     * Retrieves a single table by an arbitrary condition.
     * Used for checking unique constraints like name.
     * @param {Object} condition - An object containing key-value pairs for the WHERE clause.
     * @returns {Promise<Object|undefined>} The table object or undefined if not found.
     */
    async findByCondition(condition) {
        return db(this.table).where(condition).first();
    }

    /**
     * Creates a new table record.
     * @param {Object} tableData - Data for the new table (name, status).
     * @returns {Promise<Object>} The created table object including its ID.
     */
    async create(tableData) {
        try {
            // Knex returns an array of IDs for the inserted rows.
            // For MySQL, the first element is typically the auto-increment ID.
            const [id] = await db(this.table).insert(tableData);

            // Check if Knex returned a valid ID
            if (id === undefined || id === null) {
                console.error("Knex insertion failed to return a valid ID. Check table structure and AUTO_INCREMENT.");
                // Throw an error to be caught by the Controller
                throw new Error("Failed to retrieve new table ID after insertion.");
            }

            // Fetch the created record to return the full object with all defaults/fields
            return this.findById(id); 
            
        } catch (error) {
            // CRITICAL: Log the detailed SQL error for debugging
            console.error('DATABASE INSERTION ERROR in TableRepository.create:', error);
            // Re-throw the error so the controller can handle the 500 response
            throw error; 
        }
    }

    /**
     * Updates an existing table record.
     * @param {number} id - The table_id to update.
     * @param {Object} tableData - Data to update (name, status, or any subset).
     * @returns {Promise<Object|undefined>} The updated table object or undefined if not found.
     */
    async update(id, tableData) {
        try {
            const rowsAffected = await db(this.table)
                .where({ table_id: id })
                .update(tableData);
            
            if (rowsAffected === 0) return undefined;
            
            return this.findById(id); 
        } catch (error) {
            console.error('DATABASE UPDATE ERROR in TableRepository.update:', error);
            throw error;
        }
    }

    /**
     * Deletes a table record.
     * @param {number} id - The table_id to delete.
     * @returns {Promise<number>} Number of rows deleted (1 or 0).
     */
    async delete(id) {
        return db(this.table)
            .where({ table_id: id })
            .del();
    }
}

module.exports = new TableRepository();