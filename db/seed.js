require('dotenv').config(); // Load environment variables
const fs = require('fs'); // Node.js built-in module for file system
const path = require('path'); // Node.js built-in module for path handling
const { query } = require('../config/db'); // Import the query function

const initSqlPath = path.join(__dirname, 'init.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');

async function seedDatabase() {
    try {
        console.log('Attempting to connect to database...');
        // Check connection by performing a simple query
        await query('SELECT 1');
        console.log('Database connection successful.');

        console.log('Seeding database...');
        // Execute the SQL script
        await query(initSql);
        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
        // Exit with an error code
        process.exit(1);
    } finally {
        // Close the database pool connections
        // Note: With a pool, it's often okay to let the script finish,
        // but explicitly ending can be good practice for scripts.
        // However, pg documentation suggests just letting the process exit
        // handles closing connections from the pool. We'll rely on that for now.
        // await pool.end(); // pool is not directly exposed by db.js
    }
}

// Run the seeding function
seedDatabase();