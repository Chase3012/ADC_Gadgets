require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_zFS0vR4esBQf@ep-lucky-waterfall-b36agqcv.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function migrate() {
  try {
    console.log('Running migration on Neon PostgreSQL...');
    await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reset_token text;');
    await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamp with time zone;');
    console.log('Migration completed successfully.');
    
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name LIKE 'reset%'
    `);
    console.log('Verified columns in profiles:');
    res.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrate();
