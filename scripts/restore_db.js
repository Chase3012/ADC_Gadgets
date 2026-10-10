require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function restore() {
  console.log('--- Database Restore Utility ---');
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    console.error('No backups directory found.');
    process.exit(1);
  }

  const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')).sort().reverse();
  if (files.length === 0) {
    console.error('No backup JSON files found in backups directory.');
    process.exit(1);
  }

  const latestFile = path.join(backupsDir, files[0]);
  console.log(`Using latest backup: ${files[0]}`);
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM chats');
    await client.query('DELETE FROM loans');
    await client.query("DELETE FROM profiles WHERE role != 'admin'");

    // Restore profiles
    if (data.tables.profiles) {
      for (const p of data.tables.profiles) {
        if (p.role !== 'admin') {
          const keys = Object.keys(p);
          const vals = Object.values(p);
          const cols = keys.map(k => `"${k}"`).join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          await client.query(`INSERT INTO profiles (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
        }
      }
      console.log(`✓ Restored ${data.tables.profiles.length} profiles`);
    }

    // Restore loans
    if (data.tables.loans) {
      for (const l of data.tables.loans) {
        const keys = Object.keys(l);
        const vals = Object.values(l);
        const cols = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(`INSERT INTO loans (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
      }
      console.log(`✓ Restored ${data.tables.loans.length} loans`);
    }

    // Restore payments
    if (data.tables.payments) {
      for (const pay of data.tables.payments) {
        const keys = Object.keys(pay);
        const vals = Object.values(pay);
        const cols = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(`INSERT INTO payments (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
      }
      console.log(`✓ Restored ${data.tables.payments.length} payments`);
    }

    // Restore chats
    if (data.tables.chats) {
      for (const c of data.tables.chats) {
        const keys = Object.keys(c);
        const vals = Object.values(c);
        const cols = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(`INSERT INTO chats (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
      }
      console.log(`✓ Restored ${data.tables.chats.length} chats`);
    }

    await client.query('COMMIT');
    console.log('\n--- Restore completed successfully! ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Restore failed:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

restore();
