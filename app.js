const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 

// Assuming your Knex instance is initialized and exported from this config file
const db = require('./config/db'); 

// --- Import Routers ---
// Adjust the paths based on your file structure (assuming sibling directories)
const orderRouter = require('./routes/orderRoutes');
const itemRouter = require('./routes/itemRoutes'); 
const userRouter = require('./routes/UserRoutes'); 
const tableRouter = require('./routes/tableRoutes');


const app = express();
const port = 3000;

// Middleware setup

// Enable CORS for all origins, allowing your React frontend (webhub) to connect
// IMPORTANT: This must be before other app.use calls
app.use(cors()); 

// Parse incoming JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- API Routes (Prefixing all routes with /api) ---
// Frontend is configured to use API_BASE_URL = 'http://localhost:3000/api'

// 1. Orders Management (handles /api/orders/* routes)
app.use('/api/orders', orderRouter); 

// 2. Menu Item Management (handles /api/items/* routes)
app.use('/api/items', itemRouter);

// 3. User Management: Mounts the UserRoutes.js file, enabling CRUD operations on http://localhost:3000/api/users
app.use('/api/users', userRouter);

// 4. Table Management: Mounts the tableRoutes.js file, enabling CRUD operations on http://localhost:3000/api/tables
app.use('/api/tables', tableRouter);


// --- Server Startup ---

// Simple connection test to ensure the database is accessible
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful!');
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    // It's good practice to exit the application if the database connection fails on startup
    process.exit(1); 
  });