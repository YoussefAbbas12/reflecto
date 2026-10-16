const path = require('path');
const { pool } = require('../config/database');

async function migrate() {
  try {
    // 1. Add technician_commission column to appointments if not exists
    const [cols] = await pool.query("SHOW COLUMNS FROM appointments LIKE 'technician_commission'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE appointments ADD COLUMN technician_commission DECIMAL(10, 2) DEFAULT 0.00");
      console.log('Added technician_commission to appointments');
    }

    // 2. Add technician_commission column to work_orders if not exists
    const [woCols] = await pool.query("SHOW COLUMNS FROM work_orders LIKE 'technician_commission'");
    if (woCols.length === 0) {
      await pool.query("ALTER TABLE work_orders ADD COLUMN technician_commission DECIMAL(10, 2) DEFAULT 0.00");
      console.log('Added technician_commission to work_orders');
    }

    // 3. Create technician_commissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS technician_commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        technician_id INT NOT NULL,
        appointment_id INT NULL,
        work_order_id INT NULL,
        service_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) DEFAULT 'SAR',
        vehicle_info VARCHAR(255) NULL,
        vehicle_plate VARCHAR(50) NULL,
        client_name VARCHAR(255) NULL,
        branch_name VARCHAR(100) NULL,
        notes TEXT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tech_id (technician_id),
        INDEX idx_appt_id (appointment_id),
        INDEX idx_wo_id (work_order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('technician_commissions table is ready');

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
