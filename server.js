require('dotenv').config();
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);
const express = require('express');
const { Pool } = require('pg');
const { OpenAI } = require('openai');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch all products (menu items)
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch single product by name
app.get('/api/products/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE LOWER(name) = LOWER($1)', [name]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint - connect to OpenAI
app.post('/api/chat', async (req, res) => {
  const { message, spiciness } = req.body;

  try {
    const prompt = `
You are TasteMate, an AI Flavor Companion helping customers at a taco restaurant called Momma's Tacos.
The customer says: "${message}".
Their preferred spiciness level is ${spiciness} out of 5.

Based on their craving and spiciness level, suggest ONE menu item from Momma's Tacos or create a custom taco recommendation if none match exactly.

Respond in a friendly, warm, and flavorful tone. Keep it under 60 words.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a friendly food recommendation assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiReply = completion.choices[0].message.content.trim();

    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  pool.end(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

// Start Server
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on port 3001');
});
