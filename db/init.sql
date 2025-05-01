-- Drop tables if they exist (useful for resetting during development)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS general_info CASCADE;

-- Create the products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    flavor_profile TEXT, -- e.g., 'Spicy, Savory, Tangy'
    price DECIMAL(10, 2) -- Optional: Add price if you like, though not strictly required by current features
);

-- Create the general_info table
CREATE TABLE general_info (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'restaurant_name', 'description', 'address', 'hours'
    info TEXT
);

-- Insert example data for Momma's Tacos
-- Products
INSERT INTO products (name, description, flavor_profile) VALUES
('Carne Asada Taco', 'Grilled marinated steak served in a warm corn tortilla with cilantro and onions.', 'Savory, Smoky, Fresh'),
('Al Pastor Taco', 'Spicy marinated pork carved from a vertical spit, served in a corn tortilla with pineapple, cilantro, and onions.', 'Spicy, Sweet, Savory, Tangy'),
('Chicken Tinga Taco', 'Shredded chicken in a smoky, spicy chipotle tomato sauce.', 'Spicy, Smoky, Savory'),
('Carnitas Taco', 'Slow-cooked, tender pork served crispy with cilantro and onions.', 'Savory, Rich'),
('Fish Taco (Baja Style)', 'Crispy battered white fish with shredded cabbage, pico de gallo, and creamy chipotle sauce.', 'Savory, Creamy, Tangy, Fresh'),
('Vegetable Taco', 'Sautéed seasonal vegetables (bell peppers, onions, zucchini) with black beans.', 'Savory, Earthy'),
('Chips and Guacamole', 'Freshly made guacamole served with crispy tortilla chips.', 'Creamy, Fresh, Savory, Tangy'),
('Chips and Salsa Roja', 'Spicy red salsa made from roasted tomatoes and chilies, served with chips.', 'Spicy, Savory, Smoky'),
('Chips and Salsa Verde', 'Tangy green salsa made from tomatillos, cilantro, and jalapeños, served with chips.', 'Tangy, Fresh, Mildly Spicy'),
('Quesadilla (Cheese)', 'Melted Monterey Jack cheese in a folded and grilled flour tortilla.', 'Creamy, Savory'),
('Horchata', 'Traditional Mexican drink made from rice milk, cinnamon, and vanilla.', 'Sweet, Creamy');


-- General Info (Example)
INSERT INTO general_info (category, info) VALUES
('restaurant_name', 'Momma''s Tacos'),
('description', 'Authentic Mexican street food.'),
('address', '123 Taco Lane, Flavorville'),
('hours', 'Mon-Sat 11 AM - 9 PM, Sun 12 PM - 7 PM');