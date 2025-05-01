const express = require('express');
const router = express.Router(); // Create a new router instance
const { query } = require('../config/db'); // Import the database query function

// GET all products
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM products');
        res.json(result.rows); // Send the rows as a JSON array
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET single product by name
// ':name' is a route parameter
router.get('/:name', async (req, res) => {
    const productName = req.params.name; // Get the name from the URL parameter
    // Use LOWER() for case-insensitive matching in the database query
    const sql = 'SELECT * FROM products WHERE LOWER(name) = LOWER($1)';
    const params = [productName];

    try {
        const result = await query(sql, params);

        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Send the first (and should be only) row
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error fetching product by name:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router; // Export the router