const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'reflecto_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    // Ensure all exhausted coupons are marked inactive
    await conn.query('UPDATE coupons SET is_active = 0 WHERE current_uses >= max_uses').catch(() => { });
    // Ensure required user columns exist on users table
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(150) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium TINYINT(1) DEFAULT 0`).catch(() => { });

    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INT UNSIGNED DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_corporate TINYINT(1) DEFAULT 0`).catch(() => { });

    // User role extensions
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin TINYINT(1) DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100) DEFAULT NULL`).catch(() => { });
    await conn.query(`UPDATE users SET branch_name = 'فرع جدة' WHERE (branch_name IS NULL OR branch_name = '') AND (role = 'client' OR role IS NULL OR role = '')`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions LONGTEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50) DEFAULT NULL`).catch(() => { });
    await conn.query(`CREATE UNIQUE INDEX idx_users_employee_code ON users (employee_code)`).catch(() => { });

    // Auto-populate employee_code for existing staff/admins/technicians if missing
    // Technicians get RT-XXXX, admins/staff get RM-XXXX
    try {
      const [staffWithoutCode] = await conn.query(
        `SELECT id, role FROM users WHERE (employee_code IS NULL OR employee_code = '') AND (role IN ('admin', 'super_admin', 'technician') OR (role_id IS NOT NULL AND role_id > 0)) ORDER BY id ASC`
      );
      for (const staff of (staffWithoutCode || [])) {
        const prefix = staff.role === 'technician' ? 'RT' : 'RM';
        const code = `${prefix}-${String(1000 + staff.id).padStart(4, '0')}`;
        await conn.query('UPDATE users SET employee_code = ? WHERE id = ?', [code, staff.id]).catch(() => {});
      }
    } catch (e) {
      // ignore
    }

    // Migrate old EMP- codes to role-based format RT- / RM-
    try {
      const [oldCodes] = await conn.query(
        `SELECT id, role FROM users WHERE employee_code LIKE 'EMP-%' AND role IN ('admin', 'super_admin', 'technician') ORDER BY id ASC`
      );
      for (const staff of (oldCodes || [])) {
        const prefix = staff.role === 'technician' ? 'RT' : 'RM';
        const newCode = `${prefix}-${String(1000 + staff.id).padStart(4, '0')}`;
        const [[taken]] = await conn.query('SELECT id FROM users WHERE employee_code = ? AND id != ? LIMIT 1', [newCode, staff.id]).catch(() => [[null]]);
        if (!taken) {
          await conn.query('UPDATE users SET employee_code = ? WHERE id = ?', [newCode, staff.id]).catch(() => {});
        }
      }
    } catch (e) {
      // ignore migration errors
    }


    await conn.query(`ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS work_order_uuid VARCHAR(100) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE loyalty_transactions MODIFY COLUMN type ENUM('earned','redeemed','transferred_out','transferred_in','gifted','awarded_by_admin','deducted_by_admin') NOT NULL DEFAULT 'earned'`).catch(() => { });

    // Companies / Entities Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36) NOT NULL DEFAULT (UUID()),
        name VARCHAR(150) NOT NULL,
        logo_url VARCHAR(255) DEFAULT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0.00,
        custom_message TEXT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `).catch((e) => console.error('Companies table creation note:', e.message));

    // Ensure super admin status for admins
    await conn.query(`UPDATE users SET is_super_admin = 1 WHERE role = 'admin' OR role = 'super_admin'`).catch(() => { });

    // AI Settings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        key_name VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `).catch(() => { });

    // Seed default AI Company Knowledge Base if not existing
    const defaultKnowledgeBase = `COMPANY IDENTITY:
الاسم الرسمي: ريفليكتو لحماية وتظليل وتطوير السيارات (Reflecto Premium Car Protection)
المجال: حماية وتظليل وتطوير السيارات، حلول حماية الطلاء، العزل الحراري، خدمات العناية بالسيارات.

EXCLUSIVE AGENCY:
ريفليكتو هي الوكيل الحصري الرسمي والوحيد في المملكة العربية السعودية لمنتجات وحلول شركة Apeax الامريكية المتخصصة في تقنيات وبراءات اختراع حماية السيارات.

BRAND VISION:
"نبيعك ما نثق به، ونضمن لك ما نستطيع الالتزام به." — حماية بمستوى عسكري مع الحفاظ على لمسة صالة العرض.

STANDARDS & QUALIFICATIONS:
- بيئة خالية من الغبار معتمدة من آيزو (ISO).
- مواد عالية التقنية والجودة.
- فنيون خبراء معتمدون ومختصون.
- ضمان موثق وواقعي لمدة 5 سنوات على خدمات الحماية.

PRODUCTS & SERVICES DETAILS:
1. أفلام حماية الطلاء PPF (Paint Protection Film):
   - فيلم حماية شفاف قوي يُثبت على الطلاء لحمايته من الخدوش السطحية، الاحتكاكات، الحصى والدقائق الخارجية.
   - يتميز بخاصية التجدد الذاتي (Self-Healing) للخدوش السطحية بالحرارة.
   - يحافظ على لون ولمعان الطلاء الأصلي وقيمة السيارة.

2. النانو سيراميك (Nano Ceramic Coating 9H):
   - طبقة حماية سائلة فائقة الشفافية تُطبق على السطح بعد التجهيز والتلميع.
   - تعزز عمق اللمعان الزجاجي، وتقوم بمقاومة التصاق المياه والأوساخ والملوثات وتسهل عملية الغسيل.
   - تتوفر طبقات نانو سيراميك مخصصة للهيكل الخارجي، الجنوط، والمقصورة الداخلية.

3. العازل الحراري للسيارات (Apeax Thermal Insulation):
   - أفلام عازلة متخصصة تُثبت على زجاج السيارة من منتجات Apeax الامريكية.
   - تعزل نسبة عالية تصل إلى 95% من الحرارة والأشعة فوق البنفسجية والأشعة تحت الحمراء الضارة.
   - تحمي ديكورات ومقصورة السيارة وتقليل الحمل على نظام التكييف.

4. تلميع وتصحيح الطلاء (Paint Polishing & Correction):
   - معالجة وتلميع احترافي لإزالة الخدوش السطحية ودوائر الغسيل والباستيل واستعادة بريق الطلاء.

5. كاميرات المراقبة للسيارات (Dashcam):
   - توريد وتركيب كاميرات مراقبة للسيارات احترافية (Dashcam).

WARRANTY EXPLANATION (لماذا ضمان 5 سنوات):
تمنح ريفليكتو ضمانًا رسمياً حتى 5 سنوات. اخترنا 5 سنوات كمدة واقعية وتحفظية تتناسب مع البيئة الخليجية شديدة الحرارة والتعرض القوي للأشعة فوق البنفسجية والغبار، للوفاء والالتزام التام بكفاءة الأداء طوال المدة بدلاً من تقديم أرقام تسويقية طويلة لا تصمد في الواقع.

PRICES & PACKAGES:
- تبدأ أسعار الباقات من 350 ريال سعودي.
- تختلف الأسعار والدراسة بحسب نوع السيارة وحجمها وموديلها ومساحة التغطية المطلوب حمايتها.

BRANCHES & CONTACT INFO:
▪️ جدة (الفيصلية - الفرع الرئيسي): +966 55 872 2444
▪️ الرياض (فرع الفيصلية 1، فرع الفيصلية 2)
▪️ مكة المكرمة: +966 53 533 2279
▪️ الطائف: +966 53 533 2279
▪️ المدينة المنورة: +966 55 872 2444
▪️ الدمام

BOOKING & APPOINTMENTS:
يمكن للعميل حجز موعد لسيارته من خلال الموقع الإلكتروني باختيار الخدمة والفرع المناسب، أو التواصل المباشر عبر الهاتف والواتساب مع الفروع.

LOYALTY PROGRAM:
برنامج نقاط الولاء في ريفليكتو بيسمح للعميل كسب نقاط مع كل حجز وسداد، واستبدال النقاط مباشرة بكوبونات خصم من لوحة تحكم حسابه.`;

    await conn.query(
      `INSERT IGNORE INTO ai_settings (key_name, setting_value) VALUES ('grok_system_prompt', ?)`,
      [defaultKnowledgeBase]
    ).catch(() => { });

    // Ensure work_orders table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS work_orders (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36) NOT NULL DEFAULT (UUID()),
        work_order_number VARCHAR(50) NOT NULL,
        client_name VARCHAR(150) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        order_date DATE DEFAULT NULL,
        
        heat_insulation TEXT DEFAULT NULL,
        polishing TEXT DEFAULT NULL,
        nano_ceramic TEXT DEFAULT NULL,
        ppf TEXT DEFAULT NULL,
        ppf_partial_details VARCHAR(255) DEFAULT NULL,
        removal_services TEXT DEFAULT NULL,
        client_type VARCHAR(100) DEFAULT NULL,

        price DECIMAL(10,2) DEFAULT 0.00,
        vat_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        remaining_amount DECIMAL(10,2) DEFAULT 0.00,

        vehicle_type VARCHAR(100) DEFAULT NULL,
        vehicle_model VARCHAR(100) DEFAULT NULL,
        vehicle_year VARCHAR(50) DEFAULT NULL,
        vehicle_color VARCHAR(50) DEFAULT NULL,
        vehicle_plate VARCHAR(50) DEFAULT NULL,
        chassis_number VARCHAR(100) DEFAULT NULL,
        mileage_km VARCHAR(50) DEFAULT NULL,
        inspection_notes TEXT DEFAULT NULL,
        inspection_checklist TEXT DEFAULT NULL,

        reception_name VARCHAR(100) DEFAULT NULL,
        accountant_name VARCHAR(100) DEFAULT NULL,
        sales_manager_name VARCHAR(100) DEFAULT NULL,
        delivery_date DATETIME DEFAULT NULL,
        has_warranty TINYINT(1) DEFAULT 0,
        warranty_years INT DEFAULT 0,
        warranty_start_date DATE DEFAULT NULL,
        warranty_end_date DATE DEFAULT NULL,
        received_by_name VARCHAR(100) DEFAULT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'delivered') NOT NULL DEFAULT 'pending',

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `).catch((e) => console.error('Work orders table creation note:', e.message));

    // Migration alters for existing databases
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS heat_insulation_details VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS ppf_partial_details VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS has_warranty TINYINT(1) DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS warranty_years INT DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS warranty_start_date DATE DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS warranty_end_date DATE DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS technician_id INT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS technician_name VARCHAR(150) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS service_progress TEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS service_warranties TEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS started_at DATETIME DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS completed_at DATETIME DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0.00`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS company_name VARCHAR(150) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS product_name VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS product_model VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS coverage_area VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS service_details TEXT DEFAULT NULL`).catch(() => { });

    await conn.query(`ALTER TABLE warranties DROP INDEX uq_appointment`).catch(() => { });
    await conn.query(`SET FOREIGN_KEY_CHECKS=0;`).catch(() => { });
    await conn.query(`ALTER TABLE warranties MODIFY COLUMN appointment_id INT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties MODIFY COLUMN vehicle_id INT NULL`).catch(() => { });
    await conn.query(`SET FOREIGN_KEY_CHECKS=1;`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(150) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'years'`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS coverage_months INT DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS work_order_id INT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS product_name VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS product_model VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS coverage_area VARCHAR(255) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE warranties ADD COLUMN IF NOT EXISTS service_details TEXT DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100) DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage INT DEFAULT NULL`).catch(() => { });

    await conn.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_warranty TINYINT(1) DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS warranty_years INT DEFAULT 0`).catch(() => { });
    await conn.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS warranty_start_date DATE DEFAULT NULL`).catch(() => { });
    await conn.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS technician_commission DECIMAL(10, 2) DEFAULT 0.00`).catch(() => { });
    await conn.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS technician_commission DECIMAL(10, 2) DEFAULT 0.00`).catch(() => { });

    await conn.query(`
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
    `).catch(() => { });

    // Seed Sample Companies if empty
    const [[{ companyCount }]] = await conn.query('SELECT COUNT(*) AS companyCount FROM companies');
    if (companyCount === 0) {
      console.log('Seeding sample corporate companies...');
      await conn.query(`
        INSERT INTO companies (uuid, name, logo_url, discount_percent, custom_message, notes)
        VALUES 
          (UUID(), 'شركة أرامكو السعودية', NULL, 15.00, 'خصم خاص وحصري لمنسوبي وموظفي شركة أرامكو السعودية', 'عقد شراكة سنوي متجدد'),
          (UUID(), 'مجموعة STC الاتصالات', NULL, 20.00, 'خصم خاص لمنسوبي وموظفي مجموعة الاتصالات السعودية STC', 'خصم لمنسوبي قطاع الأعمال'),
          (UUID(), 'شركة سابك (SABIC)', NULL, 10.00, 'خصم خاص لموظفي شركة سابك', 'اتفاقية خدمات وتلميع لحافلات ومركبات الشركة')
      `).catch((e) => console.error('Company seed error:', e.message));
    }

    // Seed Sample Test Clients if count is low
    const [[{ clientCount }]] = await conn.query("SELECT COUNT(*) AS clientCount FROM users WHERE role = 'client'");
    if (clientCount < 3) {
      console.log('Seeding sample test clients for branches and companies...');
      const bcrypt = require('bcryptjs');
      const hashedPass = await bcrypt.hash('00000', 10);

      // Fetch company ids
      const [compRows] = await conn.query('SELECT id, name FROM companies LIMIT 3');
      const compAramco = compRows.find(c => c.name.includes('أرامكو'))?.id || compRows[0]?.id;
      const compSTC = compRows.find(c => c.name.includes('STC'))?.id || compRows[1]?.id;

      await conn.query(`
        INSERT IGNORE INTO users (uuid, phone, full_name, email, password, role, is_active, branch_name, company_id, is_corporate, created_at)
        VALUES
          (UUID(), '0501112233', 'خالد عبد الرحمن العتيبي', 'khalid@example.com', '${hashedPass}', 'client', 1, 'فرع جدة', ${compAramco || 'NULL'}, 1, NOW()),
          (UUID(), '0504445566', 'سارة محمد الشمري', 'sara@example.com', '${hashedPass}', 'client', 1, 'فرع جدة', ${compSTC || 'NULL'}, 1, NOW()),
          (UUID(), '0557778899', 'محمد عبد الله القحطاني', 'm.qahtani@example.com', '${hashedPass}', 'client', 1, 'فرع الرياض - الفيصلية 1', ${compAramco || 'NULL'}, 1, NOW()),
          (UUID(), '0569990011', 'فيصل سعيد الغامدي', 'faisal@example.com', '${hashedPass}', 'client', 1, 'فرع جدة', NULL, 0, NOW())
      `).catch((e) => console.error('Clients seed error:', e.message));
    }

    // Ensure service_reviews table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS service_reviews (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36) NOT NULL DEFAULT (UUID()),
        user_id INT UNSIGNED NOT NULL,
        order_id INT UNSIGNED DEFAULT NULL,
        appointment_id INT UNSIGNED DEFAULT NULL,
        branch_name VARCHAR(100) DEFAULT NULL,
        rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
        rating_quality TINYINT UNSIGNED NOT NULL DEFAULT 5,
        rating_staff TINYINT UNSIGNED NOT NULL DEFAULT 5,
        rating_timing TINYINT UNSIGNED NOT NULL DEFAULT 5,
        rating_system TINYINT UNSIGNED NOT NULL DEFAULT 5,
        comment TEXT DEFAULT NULL,
        points_awarded INT UNSIGNED DEFAULT 10,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_user (user_id),
        KEY idx_branch (branch_name),
        KEY idx_order (order_id),
        KEY idx_appointment (appointment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `).catch((e) => console.error('Service reviews table creation note:', e.message));

    // Migrations / additions for 4 rating criteria
    await conn.query(`ALTER TABLE service_reviews ADD COLUMN rating_quality TINYINT UNSIGNED NOT NULL DEFAULT 5`).catch(() => { });
    await conn.query(`ALTER TABLE service_reviews ADD COLUMN rating_staff TINYINT UNSIGNED NOT NULL DEFAULT 5`).catch(() => { });
    await conn.query(`ALTER TABLE service_reviews ADD COLUMN rating_timing TINYINT UNSIGNED NOT NULL DEFAULT 5`).catch(() => { });
    await conn.query(`ALTER TABLE service_reviews ADD COLUMN rating_system TINYINT UNSIGNED NOT NULL DEFAULT 5`).catch(() => { });

    // Seed Sample Reviews if table is empty
    const [[{ reviewCount }]] = await conn.query('SELECT COUNT(*) AS reviewCount FROM service_reviews');
    if (reviewCount === 0) {
      console.log('Seeding sample customer service reviews...');
      const [clients] = await conn.query("SELECT id, full_name, branch_name FROM users WHERE role = 'client' LIMIT 5");
      if (clients.length > 0) {
        const sampleReviews = [
          { user: clients[0], branch: clients[0]?.branch_name || 'فرع جدة', rating: 5, comment: 'خدمة التظليل والنانو ممتازة جداً والفنيين محترفين ونظيفين بالعمل.', date: '2026-09-01 14:30:00' },
          { user: clients[1] || clients[0], branch: clients[1]?.branch_name || 'فرع جدة', rating: 5, comment: 'حماية الـ PPF ممتازة جداً وتسليم على الوقت، شكراً لمركز ريفليكتو.', date: '2026-09-05 11:15:00' },
          { user: clients[2] || clients[0], branch: clients[2]?.branch_name || 'فرع الرياض - الفيصلية 1', rating: 4, comment: 'تجربة رائعة وتغيير ملحوظ في الحرارة مع العازل الحراري.', date: '2026-09-08 16:45:00' },
          { user: clients[3] || clients[0], branch: clients[3]?.branch_name || 'فرع مكة المكرمة', rating: 5, comment: 'تعامل راقي جداً واهتمام بأدق التفاصيل في سيارتي.', date: '2026-09-10 18:20:00' },
          { user: clients[0], branch: 'فرع المدينة المنورة', rating: 5, comment: 'سرعة في الإنجاز وجودة عالية جداً.', date: '2026-09-12 10:00:00' }
        ];

        for (const rev of sampleReviews) {
          await conn.query(
            `INSERT INTO service_reviews (uuid, user_id, branch_name, rating, comment, points_awarded, created_at)
             VALUES (UUID(), ?, ?, ?, ?, 10, ?)`,
            [rev.user.id, rev.branch, rev.rating, rev.comment, rev.date]
          ).catch(() => { });
        }
      }
    }

    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('Make sure MySQL is running and .env is configured correctly');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
