const { Pool } = require('pg');

// Use the DATABASE_URL environment variable provided by Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional: ssl configuration might be needed for production databases depending on setup.
    // Railway databases typically require SSL in production.
    // This configuration makes it work locally with a non-SSL connection and
    // in production with SSL. Adjust if encountering SSL issues.
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Function to query the database
const query = (text, params) => pool.query(text, params);

module.exports = {
    query,
};