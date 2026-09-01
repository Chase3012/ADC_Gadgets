const express = require('express');
const { Pool } = require('@neondatabase/serverless');

const app = express();
const PORT = process.env.PORT || 3000;

// Use your Neon connection string directly or via process.env
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_zFS0vR4esBQf@ep-lucky-waterfall-b36agqcv.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running and connected to Neon!');
});

// Test route to check your migrated profiles table
app.get('/profiles', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profiles');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});