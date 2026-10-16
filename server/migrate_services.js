const { pool } = require('./src/config/database');
require('dotenv').config();

async function run() {
  try {
    console.log('Running migration: Adding price to services table...');
    // check if price column already exists
    const [columns] = await pool.query("SHOW COLUMNS FROM services LIKE 'price'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE services ADD COLUMN price DECIMAL(10,2) DEFAULT NULL");
      console.log('Successfully added price column to services table');
    } else {
      console.log('price column already exists in services table');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
