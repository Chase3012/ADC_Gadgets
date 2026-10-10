require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function wipeCustomerData() {
  console.log('====================================================');
  console.log('  ADC GADGETS: EXECUTING TOTAL CUSTOMER DATA WIPE   ');
  console.log('====================================================');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete payments (child of loans)
    const payRes = await client.query('DELETE FROM payments');
    console.log(`✓ Deleted ${payRes.rowCount} payment records from 'payments'`);

    // 2. Delete chats
    const chatRes = await client.query('DELETE FROM chats');
    console.log(`✓ Deleted ${chatRes.rowCount} chat messages from 'chats'`);

    try {
      const supRes = await client.query('DELETE FROM support_chats');
      console.log(`✓ Deleted ${supRes.rowCount} support chat records from 'support_chats'`);
    } catch(e) {}

    // 3. Delete loans (child of profiles)
    const loanRes = await client.query('DELETE FROM loans');
    console.log(`✓ Deleted ${loanRes.rowCount} loan records from 'loans'`);

    // 4. Delete customer profiles (preserving Admin account)
    const profRes = await client.query(
      `DELETE FROM profiles WHERE role != 'admin' AND email != 'admin@adc.com'`
    );
    console.log(`✓ Deleted ${profRes.rowCount} customer profiles from 'profiles'`);

    // 5. Ensure admin profile is completely clean
    await client.query(`UPDATE profiles SET active_loan_model = NULL WHERE role = 'admin'`);

    await client.query('COMMIT');
    console.log('\n--- Transaction Committed Successfully! ---');

    // Verification queries
    const remainingProfs = await client.query('SELECT id, full_name, email, role FROM profiles');
    const remainingLoans = await client.query('SELECT COUNT(*) FROM loans');
    const remainingPays  = await client.query('SELECT COUNT(*) FROM payments');
    const remainingChats = await client.query('SELECT COUNT(*) FROM chats');
    const remainingDevs  = await client.query('SELECT COUNT(*) FROM devices');

    console.log('\n--- Post-Wipe State Verification ---');
    console.log(`Remaining Profiles (${remainingProfs.rows.length}):`, remainingProfs.rows);
    console.log(`Loans Count:    ${remainingLoans.rows[0].count}`);
    console.log(`Payments Count: ${remainingPays.rows[0].count}`);
    console.log(`Chats Count:    ${remainingChats.rows[0].count}`);
    console.log(`Devices Count:  ${remainingDevs.rows[0].count} (Catalog preserved)`);

    console.log('\n✓ System is now 100% clean and presentation-ready!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Wipe failed, rolled back changes:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

wipeCustomerData();
