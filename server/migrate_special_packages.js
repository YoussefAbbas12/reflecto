const { pool } = require('./src/config/database');
require('dotenv').config();

async function run() {
  try {
    console.log('Running migration: Adding client_id to pricing_tiers...');
    
    // Check if client_id column exists
    const [columns] = await pool.query("SHOW COLUMNS FROM pricing_tiers LIKE 'client_id'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE pricing_tiers ADD COLUMN client_id INT UNSIGNED DEFAULT NULL");
      await pool.query("ALTER TABLE pricing_tiers ADD CONSTRAINT fk_pricing_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE");
      console.log('Successfully added client_id column and foreign key to pricing_tiers');
    } else {
      console.log('client_id column already exists in pricing_tiers');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();