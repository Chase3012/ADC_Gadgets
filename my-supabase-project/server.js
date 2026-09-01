const express = require('express');
const cors = require('cors');
const path = require('path');
const sql = require('./db.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'src')));

// Test connection
app.get('/api/health', async (req, res) => {
    try {
        const result = await sql`SELECT version()`;
        res.json({ status: 'connected', version: result[0].version });
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM profiles`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Loans
app.get('/api/loans', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM loans`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Payments
app.get('/api/payments', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM payments`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Support Chats
app.get('/api/chats', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM support_chats ORDER BY created_at ASC`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

