const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../public/assets/company');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save base64 image locally in public/assets/company
 */
function saveLogoImage(base64Data, preferredName = 'company') {
  if (!base64Data) return null;
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let ext = 'png';
    let dataBuffer;

    if (matches) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
      dataBuffer = Buffer.from(cleanBase64, 'base64');
    }

    const filename = `${preferredName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, dataBuffer);
    return `/assets/company/${filename}`;
  } catch (err) {
    console.error('Save logo image error:', err);
    return null;
  }
}

/**
 * Get all companies with client counts and package prices
 */
async function getAll(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id, c.uuid, c.name, c.logo_url, c.discount_percent, 
        c.custom_message, c.notes, c.created_at, c.updated_at,
        COUNT(u.id) AS client_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const [pkgPrices] = await pool.query(`SELECT company_id, pricing_tier_id, custom_price FROM company_package_prices`);
    const pricesByCompany = {};
    pkgPrices.forEach(p => {
      if (!pricesByCompany[p.company_id]) pricesByCompany[p.company_id] = {};
      pricesByCompany[p.company_id][p.pricing_tier_id] = parseFloat(p.custom_price || 0);
    });

    const formatted = rows.map(r => ({
      ...r,
      discount_percent: parseFloat(r.discount_percent || 0),
      client_count: parseInt(r.client_count || 0),
      package_prices: pricesByCompany[r.id] || {}
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Companies getAll error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Get single company details, its clients, and package prices
 */
async function getOne(req, res) {
  try {
    const { id } = req.params;
    const [[company]] = await pool.query(
      'SELECT * FROM companies WHERE id = ? OR uuid = ?',
      [id, id]
    );

    if (!company) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } });
    }

    const [clients] = await pool.query(
      `SELECT uuid as id, full_name, phone, email, created_at 
       FROM users WHERE company_id = ? ORDER BY full_name ASC`,
      [company.id]
    );

    const [pkgPrices] = await pool.query(
      `SELECT pricing_tier_id, custom_price FROM company_package_prices WHERE company_id = ?`,
      [company.id]
    );
    const package_prices = {};
    pkgPrices.forEach(p => {
      package_prices[p.pricing_tier_id] = parseFloat(p.custom_price || 0);
    });

    res.json({
      success: true,
      data: {
        ...company,
        discount_percent: parseFloat(company.discount_percent || 0),
        clients,
        package_prices
      }
    });
  } catch (err) {
    console.error('Company getOne error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Save custom package prices helper
 */
async function savePackagePrices(companyId, packagePricesMap) {
  if (!companyId || !packagePricesMap || typeof packagePricesMap !== 'object') return;
  for (const [tierId, customPrice] of Object.entries(packagePricesMap)) {
    let resolvedTierId = parseInt(tierId);
    if (isNaN(resolvedTierId)) {
      const [[tierRow]] = await pool.query('SELECT id FROM pricing_tiers WHERE uuid = ? OR slug = ?', [tierId, tierId]);
      if (tierRow) resolvedTierId = tierRow.id;
    }
    if (resolvedTierId && !isNaN(resolvedTierId)) {
      const pVal = parseFloat(customPrice);
      if (customPrice !== '' && customPrice !== null && customPrice !== undefined && !isNaN(pVal) && pVal >= 0) {
        await pool.query(
          `INSERT INTO company_package_prices (company_id, pricing_tier_id, custom_price)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE custom_price = VALUES(custom_price)`,
          [companyId, resolvedTierId, pVal]
        );
      } else {
        await pool.query(
          `DELETE FROM company_package_prices WHERE company_id = ? AND pricing_tier_id = ?`,
          [companyId, resolvedTierId]
        );
      }
    }
  }
}

/**
 * Create a new company/entity
 */
async function create(req, res) {
  try {
    const { name, discount_percent, custom_message, notes, logo_base64, logo_url, package_prices } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company name is required' } });
    }

    let finalLogoUrl = logo_url || null;
    if (logo_base64) {
      const savedPath = saveLogoImage(logo_base64, name);
      if (savedPath) finalLogoUrl = savedPath;
    }

    const [result] = await pool.query(
      `INSERT INTO companies (uuid, name, logo_url, discount_percent, custom_message, notes, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        finalLogoUrl,
        parseFloat(discount_percent || 0),
        custom_message || null,
        notes || null
      ]
    );

    const companyId = result.insertId;
    if (package_prices) {
      await savePackagePrices(companyId, package_prices);
    }

    const [[newComp]] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);

    res.json({
      success: true,
      message: 'Company created successfully',
      data: {
        ...newComp,
        discount_percent: parseFloat(newComp.discount_percent || 0),
        client_count: 0,
        package_prices: package_prices || {}
      }
    });
  } catch (err) {
    console.error('Company create error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Update existing company
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, discount_percent, custom_message, notes, logo_base64, logo_url, package_prices } = req.body;

    const [[company]] = await pool.query('SELECT * FROM companies WHERE id = ? OR uuid = ?', [id, id]);
    if (!company) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } });
    }

    let finalLogoUrl = company.logo_url;
    if (logo_url !== undefined && logo_url !== null) {
      finalLogoUrl = logo_url;
    }
    if (logo_base64) {
      const savedPath = saveLogoImage(logo_base64, name || company.name);
      if (savedPath) finalLogoUrl = savedPath;
    }

    await pool.query(
      `UPDATE companies 
       SET name = COALESCE(?, name),
           logo_url = ?,
           discount_percent = COALESCE(?, discount_percent),
           custom_message = COALESCE(?, custom_message),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        finalLogoUrl,
        discount_percent !== undefined ? parseFloat(discount_percent || 0) : null,
        custom_message !== undefined ? custom_message : null,
        notes !== undefined ? notes : null,
        company.id
      ]
    );

    if (package_prices) {
      await savePackagePrices(company.id, package_prices);
    }

    const [[updatedComp]] = await pool.query('SELECT * FROM companies WHERE id = ?', [company.id]);

    const [pkgPrices] = await pool.query(
      `SELECT pricing_tier_id, custom_price FROM company_package_prices WHERE company_id = ?`,
      [company.id]
    );
    const updatedPkgPrices = {};
    pkgPrices.forEach(p => {
      updatedPkgPrices[p.pricing_tier_id] = parseFloat(p.custom_price || 0);
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: {
        ...updatedComp,
        discount_percent: parseFloat(updatedComp.discount_percent || 0),
        package_prices: updatedPkgPrices
      }
    });
  } catch (err) {
    console.error('Company update error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Delete company
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    const [[company]] = await pool.query('SELECT id FROM companies WHERE id = ? OR uuid = ?', [id, id]);
    if (company) {
      await pool.query('UPDATE users SET company_id = NULL, is_corporate = 0 WHERE company_id = ?', [company.id]);
      await pool.query('DELETE FROM company_package_prices WHERE company_id = ?', [company.id]);
      await pool.query('DELETE FROM companies WHERE id = ?', [company.id]);
    }
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Company delete error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove
};
