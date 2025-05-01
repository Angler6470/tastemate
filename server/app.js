// server/app.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const pool = require('./database');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// PostgreSQL Routes

// Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Fetch single product by name
app.get('/api/product/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE LOWER(name) = LOWER($1)', [name]);
    res.json(result.rows[0] || { message: 'Not found' });
  } catch (err) {
    console.error('Error fetching product by name:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Fetch general info by category (optional feature)
app.get('/api/info/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query('SELECT * FROM general_info WHERE LOWER(category) = LOWER($1)', [category]);
    res.json(result.rows[0] || { message: 'Not found' });
  } catch (err) {
    console.error('Error fetching info by category:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat Endpoint - connects to OpenAI
app.post('/api/chat', async (req, res) => {
  const { message, spiciness } = req.body;

  try {
    const prompt = `
You are TasteMate, a friendly AI Flavor Companion helping customers at Momma's Tacos.
Customer craving: "${message}"
Preferred spiciness: ${spiciness} out of 5.

Suggest ONE delicious menu item or create a custom taco if nothing matches exactly.
Keep your reply flavorful, friendly, have a quirky attitude, and under 60 words.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful, friendly AI food recommendation assistant for Momma`s Tacos.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiReply = completion.choices[0].message.content.trim();

    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Error generating AI reply:', error);
    res.status(500).json({ error: 'Failed to generate AI reply' });
  }
});

// Catch-all to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`TasteMate server running at http://localhost:${PORT}`);
});
