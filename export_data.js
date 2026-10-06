const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_zFS0vR4esBQf@ep-lucky-waterfall-b36agqcv.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function exportData() {
  console.log("Starting data export from Neon...");
  const tables = ['profiles', 'devices', 'loans', 'payments', 'announcements'];
  let sqlDump = '';

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${table}`);
      if (res.rows.length === 0) continue;

      console.log(`Exporting ${res.rows.length} rows from ${table}...`);
      
      const columns = Object.keys(res.rows[0]);
      
      for (const row of res.rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (Array.isArray(val)) {
             // Basic array handling for text arrays
             const arrayItems = val.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
             return `'{${arrayItems}}'`;
          }
          // Escape single quotes
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        
        sqlDump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlDump += '\n';
    } catch (err) {
      console.error(`Error exporting table ${table}:`, err.message);
    }
  }

  fs.writeFileSync('neon_export.sql', sqlDump);
  console.log("✅ Export complete! Saved to neon_export.sql");
  process.exit(0);
}

exportData();
