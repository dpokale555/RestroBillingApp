// knexfile.js

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 * * Update with your config settings.
 * The 'development' block below is configured for MySQL using the 'mysql2' driver.
 */
module.exports = {

  development: {
    // 1. Set the client to the modern MySQL driver
    client: 'mysql2',
    
    // 2. Configure the MySQL connection details
    connection: {
      host: 'localhost', // Standard localhost address
      user: 'root', // <--- !!! REPLACE with your MySQL username
      password: 'Test123', // <--- !!! REPLACE with your MySQL password
      database: 'DevDatabase', // <--- !!! REPLACE with your database name
      port: 3306 // MySQL standard port (optional, but recommended)
    },
    
    // 3. Define where Knex will look for your migration files
    migrations: {
      directory: './db/migrations' 
    },

    // 4. Define where Knex will look for your seed files (optional)
    seeds: {
        directory: './db/seeds'
    }
  },

  // The staging and production blocks are kept here for completeness, 
  // but they still use PostgreSQL client and connection settings.
  // You would need to change their 'client' to 'mysql2' and update the 'connection'
  // object if you are deploying to a MySQL server for these environments.
  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};