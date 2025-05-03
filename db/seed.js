// BACKEND FILES — Updated from latest GitHub ZIP synced to Render

// ───────────────────────────────────────────────
// 📄 db/seed.js — SEED MOMMA'S TACOS MENU
// ───────────────────────────────────────────────
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const menuItems = [
  ["Empanada", "Flour dough filled with your choice of ground seasoned chicken, ground pork, or mixed vegetables."],
  ["Pichaitas", "3 homemade mini corn tortillas topped with lettuce, cheese, and your choice of meat."],
  ["Nachos", "House-fried chips topped with cheese, lettuce, tomato, and choice of meat."],
  ["Tostadas", "2 house-fried corn tortillas with your choice of meat, lettuce, cheese, and crema."],
  ["Pico de Gallo + Chips", "House Pico de Gallo with chips."],
  ["Guacamole + Chips", "House guacamole with chips."],
  ["Esquites", "Mexican street corn cup."],
  ["Tacos", "4 corn tortillas served with your choice of meat, topped with cilantro, onions, and a side of limes."],
  ["Quesadilla", "Flour tortilla filled with cheese and your choice of meat."],
  ["Burrito", "Flour tortilla filled with meat, lettuce, crema, cheese, and Pico de Gallo."],
  ["Burrito Bowl", "Bowl with rice, beans, lettuce, crema, cheese, and your choice of meat."],
  ["Pernil or Mexican Inspired Ropa Vieja", "House-slow cooked pork served with rice and beans."],
  ["Chimichangas", "Fried tortilla burrito with meat, beans, cheese, crema, queso fresco & Pico de Gallo."],
  ["Enmoladas", "4 corn tortillas wrapped with chicken and topped with mole poblano, crema, and queso fresco."],
  ["Enchiladas Suizas", "4 corn tortillas with chicken and tomatillo sauce, crema, and melted cheese."],
  ["Nachos Supreme", "Tortilla chips topped with your choice of meat, cheese sauce, crema, and Pico de Gallo."],
  ["Tacos Dorados", "3 deep-fried tacos with cheese and choice of meat."],
  ["Chilaquiles", "Tortilla chips simmered in house salsa, topped with crema and your choice of meat."],
  ["Addita Plate", "Kids plate with rice, beans, and choice of meat."],
  ["Kids Quesadilla", "Kids-sized cheese quesadilla."],
  ["Kids Burrito", "Mini burrito with rice, beans, and choice of meat."],
  ["French Fries", "French fries with a side of ketchup or cheese."],
  ["House Soup", "Seasonal soup offering."],
  ["Taco Salad", "Tortilla bowl with lettuce, crema, cheese, meat, and salsa."]
];

(async () => {
  try {
    for (const [name, description] of menuItems) {
      await pool.query(
        'INSERT INTO products (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
        [name, description]
      );
    }
    console.log("✅ Momma's Tacos menu seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding menu:", err);
  } finally {
    await pool.end();
  }
})();
