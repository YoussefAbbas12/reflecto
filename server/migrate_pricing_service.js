const { pool } = require('./src/config/database');
require('dotenv').config();

async function run() {
  try {
    console.log('Running migration: Linking pricing_tiers with services...');
    
    // Check if service_id column exists
    const [columns] = await pool.query("SHOW COLUMNS FROM pricing_tiers LIKE 'service_id'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE pricing_tiers ADD COLUMN service_id INT UNSIGNED DEFAULT NULL");
      await pool.query("ALTER TABLE pricing_tiers ADD CONSTRAINT fk_pricing_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL");
      console.log('Successfully added service_id column and foreign key to pricing_tiers');
    } else {
      console.log('service_id column already exists in pricing_tiers');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
