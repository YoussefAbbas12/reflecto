const { pool } = require('./src/config/database');

async function migrate() {
  try {
    console.log('Starting migration for company package prices and roles...');

    // 1. Create company_package_prices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_package_prices (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        company_id INT UNSIGNED NOT NULL,
        pricing_tier_id INT UNSIGNED NOT NULL,
        custom_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY company_tier_unique (company_id, pricing_tier_id),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ company_package_prices table created/verified.');

    // 2. Create roles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36) NOT NULL DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) DEFAULT NULL,
        permissions LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(permissions)),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ roles table created/verified.');

    // 3. Ensure permissions and role_id column exist on users table
    const [userCols] = await pool.query('SHOW COLUMNS FROM users');
    const colNames = userCols.map(c => c.Field);

    if (!colNames.includes('permissions')) {
      await pool.query('ALTER TABLE users ADD COLUMN permissions LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(permissions))');
      console.log('✔ Added permissions column to users table.');
    }

    if (!colNames.includes('role_id')) {
      await pool.query('ALTER TABLE users ADD COLUMN role_id INT UNSIGNED DEFAULT NULL');
      console.log('✔ Added role_id column to users table.');
    }

    if (!colNames.includes('is_super_admin')) {
      await pool.query('ALTER TABLE users ADD COLUMN is_super_admin TINYINT(1) DEFAULT 0');
      console.log('✔ Added is_super_admin column to users table.');
    }

    // Update main admin to be super admin
    await pool.query("UPDATE users SET is_super_admin = 1 WHERE role = 'admin' OR email LIKE '%admin%' OR email LIKE '%youssef%' LIMIT 10");
    console.log('✔ Super admin flag set for admin users.');

    // 4. Insert default roles if table is empty
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) as cnt FROM roles');
    if (cnt === 0) {
      const defaultPermissions = JSON.stringify({
        view_overview: true,
        view_orders: true,
        view_appointments: true,
        view_contact_requests: true,
        view_clients: true,
        view_client_details: true,
        view_employees: true,
        view_companies: true,
        view_packages: true,
        view_coupons: true,
        view_reviews: true,
        view_billing: true,
        view_checklists: true,
        // Action permissions default false for view-only roles
        create_client: false,
        edit_client: false,
        delete_client: false,
        create_order: false,
        edit_order: false,
        manage_companies: false,
        manage_packages: false,
        manage_coupons: false,
        manage_ai: false,
        create_checklist: false,
        edit_checklist: false,
        manage_permissions: false
      });

      await pool.query(`
        INSERT INTO roles (name, slug, description, permissions) VALUES
        ('مدير فرع', 'branch_manager', 'صلاحية لعرض كافة الصفحات والتقارير دون التعديل أو الإضافة', ?),
        ('مشرف فرع', 'branch_supervisor', 'مشرف فرع مع إمكانية متابعة العمليات', ?)
      `, [defaultPermissions, defaultPermissions]);
      console.log('✔ Default roles inserted.');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
