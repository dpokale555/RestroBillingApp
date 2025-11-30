const TableRepository = require('../repositories/TableRepository'); 

/**
 * Controller for handling all Table management API requests.
 */
class TableController {
    /**
     * GET /tables - Retrieve all tables.
     */
    async getAllTables(req, res) {
        try {
            const tables = await TableRepository.findAll();
            res.json(tables);
        } catch (error) {
            console.error('Error fetching tables:', error);
            res.status(500).json({ message: 'Failed to retrieve tables.' });
        }
    }

    /**
     * GET /tables/:id - Retrieve a single table by ID.
     */
    async getTableById(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid table ID.' });
        }
        
        try {
            const table = await TableRepository.findById(id);
            if (!table) {
                return res.status(404).json({ message: 'Table not found.' });
            }
            res.json(table);
        } catch (error) {
            console.error('Error fetching table by ID:', error);
            res.status(500).json({ message: 'Failed to retrieve table.' });
        }
    }

    /**
     * POST /tables - Create a new table.
     */
    async createTable(req, res) {
        // Only destructure 'name' and 'status' as per current business logic
        let { name, status } = req.body; 
        
        // --- Input Validation ---
        
        name = name ? String(name).trim() : null;
        
        if (!name) {
            return res.status(400).json({ message: 'Table name is required.' });
        }
        
        try {
            // Check if table name already exists (assuming 'name' is unique)
            const existingTable = await TableRepository.findByCondition({ name });
            if (existingTable) {
                return res.status(409).json({ message: `Table name '${name}' already exists.` });
            }

            // Combine data, defaulting status to 'Free' (matching DB default) if not provided
            const tableData = { 
                name, 
                status: status || 'Free'
            };

            const newTable = await TableRepository.create(tableData);
            res.status(201).json(newTable);
        } catch (error) {
            console.error('Error creating table:', error);
            // Handle unique constraint violation 
            if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('unique constraint'))) {
                return res.status(409).json({ message: `Table name '${name}' is already taken.` });
            }
            res.status(500).json({ message: 'Failed to create new table.' });
        }
    }
    
    /**
     * PUT /tables/:id - Update an existing table.
     */
    async updateTable(req, res) {
        const id = parseInt(req.params.id);
        let updateData = req.body;
        
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid table ID.' });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Request body cannot be empty for update.' });
        }
        
        // --- Data Sanitization for Update ---
        // Filter out any unwanted fields, only allowing 'name' and 'status'
        const allowedUpdates = {};
        if (updateData.name !== undefined) {
             allowedUpdates.name = String(updateData.name).trim();
        }
        if (updateData.status !== undefined) {
             allowedUpdates.status = String(updateData.status);
        }
        
        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update (only name and status are supported).' });
        }

        try {
            const updatedTable = await TableRepository.update(id, allowedUpdates);
            
            if (!updatedTable) {
                return res.status(404).json({ message: 'Table not found for update.' });
            }
            
            res.json(updatedTable);
        } catch (error) {
            console.error('Error updating table:', error);
             // Handle unique constraint violation
            if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('unique constraint'))) {
                const name = allowedUpdates.name || 'provided name';
                return res.status(409).json({ message: `Table name '${name}' is already taken.` });
            }
            res.status(500).json({ message: 'Failed to update table.' });
        }
    }

    /**
     * DELETE /tables/:id - Delete a table.
     */
    async deleteTable(req, res) {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid table ID.' });
        }

        try {
            const rowsDeleted = await TableRepository.delete(id);
            if (rowsDeleted === 0) {
                return res.status(404).json({ message: 'Table not found for deletion.' });
            }
            res.status(204).send(); // No content on successful deletion
        } catch (error) {
            console.error('Error deleting table:', error);
            res.status(500).json({ message: 'Failed to delete table.' });
        }
    }
}

module.exports = new TableController();