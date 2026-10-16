const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });
async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });
  const [admin] = await pool.query("SELECT * FROM users WHERE role = 'admin'");
  if(admin.length === 0) {
    await pool.query("INSERT INTO users (full_name, phone, role, is_active, uuid) VALUES ('Admin', '01000000000', 'admin', 1, UUID())");
    console.log('Created default admin: 01000000000');
  } else {
    console.log('Admin already exists with phone:', admin[0].phone);
  }
  process.exit(0);
}
main();
