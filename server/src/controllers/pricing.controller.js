const { pool } = require('../config/database');

async function getAll(req, res) {
  try {
    let companyId = req.query.company_id;
    if (!companyId || companyId === '[object Object]' || companyId === 'undefined') {
      companyId = req.user?.company_id || null;
    }

    const [rows] = await pool.query(
      `SELECT pt.id AS int_id, COALESCE(pt.uuid, CAST(pt.id AS CHAR)) AS id, pt.slug, pt.name_en, pt.name_ar, pt.tagline_en, pt.tagline_ar,
         pt.price, pt.currency, pt.warranty_years, pt.is_popular, pt.features_en, pt.features_ar, pt.sort_order,
         s.uuid AS service_uuid, s.name_ar AS service_name_ar, s.name_en AS service_name_en,
         u.uuid AS client_uuid, u.full_name AS client_name, u.phone AS client_phone
       FROM pricing_tiers pt
       LEFT JOIN services s ON pt.service_id = s.id
       LEFT JOIN users u ON pt.client_id = u.id
       ORDER BY pt.sort_order ASC, pt.id DESC`
    );

    let companyCustomPrices = {};
    let companyDiscountPercent = 0;
    if (companyId) {
      const [[comp]] = await pool.query('SELECT discount_percent FROM companies WHERE id = ? OR uuid = ?', [companyId, companyId]);
      if (comp) companyDiscountPercent = parseFloat(comp.discount_percent || 0);

      const [cpRows] = await pool.query(
        `SELECT pricing_tier_id, custom_price FROM company_package_prices WHERE company_id = ? OR company_id = (SELECT id FROM companies WHERE uuid = ? OR id = ?)`,
        [companyId, companyId, companyId]
      );
      cpRows.forEach(c => {
        companyCustomPrices[c.pricing_tier_id] = parseFloat(c.custom_price);
      });
    }

    res.json({
      data: rows.map((r) => {
        const basePrice = parseFloat(r.price) || 0;
        const customPrice = companyCustomPrices[r.int_id];
        const hasCustomPrice = customPrice !== undefined && customPrice !== null && !isNaN(customPrice);
        let finalPrice = basePrice;
        let isCompanyPrice = false;

        if (hasCustomPrice) {
          finalPrice = customPrice;
          isCompanyPrice = true;
        } else if (companyDiscountPercent > 0) {
          finalPrice = parseFloat((basePrice * (1 - companyDiscountPercent / 100)).toFixed(2));
          isCompanyPrice = true;
        }

        return {
          id:            r.id || String(r.int_id),
          int_id:        r.int_id,
          slug:          r.slug,
          name_en:       r.name_en,
          name_ar:       r.name_ar,
          service_name_ar: r.service_name_ar || null,
          service_name_en: r.service_name_en || null,
          tagline_en:    r.tagline_en,
          tagline_ar:    r.tagline_ar,
          price:         finalPrice,
          original_price: basePrice,
          is_company_price: isCompanyPrice,
          currency:      r.currency || 'SAR',
          warranty_years: parseInt(r.warranty_years) || 0,
          is_popular:    !!r.is_popular,
          features_en:   typeof r.features_en === 'string' ? (JSON.parse(r.features_en || '[]')) : (r.features_en || []),
          features_ar:   typeof r.features_ar === 'string' ? (JSON.parse(r.features_ar || '[]')) : (r.features_ar || []),
          service_id:    r.service_uuid || null,
          client_id:     r.client_uuid || null,
          client_name:   r.client_name || null,
          client_phone:  r.client_phone || null,
        };
      }),
    });
  } catch (err) {
    console.error('Pricing getAll error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function create(req, res) {
  try {
    const { slug, name_en, name_ar, tagline_en, tagline_ar, price, currency, warranty_years, is_popular, features_en, features_ar, sort_order, service_id, client_id } = req.body;
    
    let generatedSlug = slug;
    if (!generatedSlug || typeof generatedSlug !== 'string' || !generatedSlug.trim()) {
      const base = (name_en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      generatedSlug = base ? `${base}-${Date.now()}` : `pkg-${Date.now()}`;
    }

    let resolvedServiceId = null;
    if (service_id) {
      const [serviceRows] = await pool.query('SELECT id FROM services WHERE uuid = ? OR id = ?', [service_id, service_id]);
      if (serviceRows.length > 0) {
        resolvedServiceId = serviceRows[0].id;
      }
    }

    let resolvedClientId = null;
    if (client_id) {
      const [clientRows] = await pool.query('SELECT id FROM users WHERE uuid = ? OR id = ?', [client_id, client_id]);
      if (clientRows.length > 0) {
        resolvedClientId = clientRows[0].id;
      }
    }

    await pool.query(
      `INSERT INTO pricing_tiers (uuid, slug, name_en, name_ar, tagline_en, tagline_ar, price, currency, warranty_years, is_popular, features_en, features_ar, sort_order, service_id, client_id)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, COALESCE(?, 'SAR'), ?, ?, ?, ?, COALESCE(?, 0), ?, ?)`,
      [
        generatedSlug,
        name_en || 'Package',
        name_ar || 'باقة',
        tagline_en || null,
        tagline_ar || null,
        parseFloat(price) || 0,
        currency || 'SAR',
        parseInt(warranty_years) || 0,
        is_popular ? 1 : 0,
        JSON.stringify(features_en || []),
        JSON.stringify(features_ar || []),
        parseInt(sort_order) || 0,
        resolvedServiceId,
        resolvedClientId
      ]
    );

    res.json({ success: true, message: 'Pricing tier created' });
  } catch (err) {
    console.error('Pricing create error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { slug, name_en, name_ar, tagline_en, tagline_ar, price, currency, warranty_years, is_popular, features_en, features_ar, sort_order, service_id, client_id } = req.body;
    
    let resolvedServiceId = null;
    if (service_id) {
      const [serviceRows] = await pool.query('SELECT id FROM services WHERE uuid = ? OR id = ?', [service_id, service_id]);
      if (serviceRows.length > 0) {
        resolvedServiceId = serviceRows[0].id;
      }
    }

    let resolvedClientId = null;
    if (client_id) {
      const [clientRows] = await pool.query('SELECT id FROM users WHERE uuid = ? OR id = ?', [client_id, client_id]);
      if (clientRows.length > 0) {
        resolvedClientId = clientRows[0].id;
      }
    }

    const [result] = await pool.query(
      `UPDATE pricing_tiers SET 
         name_en = COALESCE(?, name_en), 
         name_ar = COALESCE(?, name_ar), 
         tagline_en = ?, 
         tagline_ar = ?, 
         price = ?, 
         currency = COALESCE(?, 'SAR'), 
         warranty_years = ?, 
         is_popular = ?, 
         features_en = ?, 
         features_ar = ?, 
         sort_order = COALESCE(?, 0),
         service_id = ?,
         client_id = ?
       WHERE (uuid = ? OR id = ? OR slug = ?)`,
      [
        name_en,
        name_ar,
        tagline_en || null,
        tagline_ar || null,
        parseFloat(price) || 0,
        currency || 'SAR',
        parseInt(warranty_years) || 0,
        is_popular ? 1 : 0,
        JSON.stringify(features_en || []),
        JSON.stringify(features_ar || []),
        sort_order || 0,
        resolvedServiceId,
        resolvedClientId,
        id, id, id
      ]
    );

    res.json({ success: true, message: 'Pricing tier updated', affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Pricing update error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pricing_tiers WHERE (uuid = ? OR id = ? OR slug = ?)', [id, id, id]);
    res.json({ success: true, message: 'Pricing tier deleted' });
  } catch (err) {
    console.error('Pricing delete error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = { getAll, create, update, remove };
