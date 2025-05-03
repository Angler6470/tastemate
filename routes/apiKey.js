const express = require('express');
const router = express.Router();
const pool = require('../server/database');
const { encrypt, decrypt } = require('../utils/encrypt');

// POST: Save encrypted OpenAI key to DB
router.post('/api/key', async (req, res) => {
  const { restaurant, apiKey } = req.body;
  if (!restaurant || !apiKey) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const encryptedKey = encrypt(apiKey);
    await pool.query(
      'INSERT INTO api_keys (restaurant_name, encrypted_key) VALUES ($1, $2)',
      [restaurant, encryptedKey]
    );
    res.status(200).json({ message: 'API key saved successfully' });
  } catch (err) {
    console.error('Failed to store API key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Retrieve decrypted OpenAI key by restaurant
router.get('/api/key/:restaurant', async (req, res) => {
  const { restaurant } = req.params;
  try {
    const result = await pool.query(
      'SELECT encrypted_key FROM api_keys WHERE restaurant_name = $1 ORDER BY created_at DESC LIMIT 1',
      [restaurant]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }
    const decrypted = decrypt(result.rows[0].encrypted_key);
    res.json({ apiKey: decrypted });
  } catch (err) {
    console.error('Failed to retrieve API key:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
