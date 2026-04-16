const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// GET all orders
app.get('/api/orders', async (req, res) => {
    console.log('Fetching all orders');
    const result = await pool.query('SELECT * FROM sales_orders ORDER BY created_at DESC');
    res.json(result.rows);
});

// CREATE
app.post('/api/orders', async (req, res) => {
    console.log('Received order data:', req.body);
    const { order_number, customer_name, amount } = req.body;
    const result = await pool.query(
        'INSERT INTO sales_orders (order_number, customer_name, amount) VALUES ($1, $2, $3) RETURNING *',
        [order_number, customer_name, amount]
    );
    res.json(result.rows[0]);
});

// UPDATE
app.put('/api/orders/:id', async (req, res) => {
    console.log('Updating order ID:', req.params.id, 'with data:', req.body);
    const { customer_name, amount } = req.body;
    const result = await pool.query(
        'UPDATE sales_orders SET customer_name=$1, amount=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
        [customer_name, amount, req.params.id]
    );
    res.json(result.rows[0]);
});

// DELETE
app.delete('/api/orders/:id', async (req, res) => {
    console.log('Deleting order ID:', req.params.id);
    await pool.query('DELETE FROM sales_orders WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));

// IMPORTANT: bind to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

