require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function backup() {
  console.log('--- Starting Database Backup ---');
  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  const tables = ['profiles', 'loans', 'payments', 'chats'];
  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${table}`);
      backupData.tables[table] = res.rows;
      console.log(`✓ Backed up ${table}: ${res.rows.length} rows`);
    } catch (err) {
      console.warn(`! Could not backup ${table}:`, err.message);
    }
  }

  const fileName = `backup_before_wipe_${Date.now()}.json`;
  const filePath = path.join(__dirname, '..', 'backups', fileName);
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`\nBackup saved successfully to: ${filePath}`);
  process.exit(0);
}

backup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
