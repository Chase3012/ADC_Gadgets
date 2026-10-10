require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function test() {
  try {
    const res = await pool.query('SELECT id FROM loans LIMIT 1');
    if (res.rows.length === 0) return console.log('No loans');
    const id = res.rows[0].id;
    const paid = 30000;
    
    console.log('Inserting payment...');
    await pool.query(
      `INSERT INTO payments (loan_id, amount_paid, payment_date, payment_method, checkout_session_id) VALUES ($1, $2, NOW(), 'cash', 'manual_cash')`,
      [id, paid]
    );
    console.log('Insert successful');
  } catch(e) {
    console.error('Insert error:', e);
  }
  process.exit();
}
test();
