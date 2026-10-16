const { pool } = require('../config/database');

async function getAll(req, res) {
  const includeInactive = req.query.all === 'true';
  const query = includeInactive 
    ? `SELECT uuid AS id, slug, name_en, name_ar, description_en, description_ar, is_active FROM services ORDER BY id ASC`
    : `SELECT uuid AS id, slug, name_en, name_ar, description_en, description_ar, is_active FROM services WHERE is_active = 1 ORDER BY id ASC`;
  const [rows] = await pool.query(query);
  res.json({
    data: rows
  });
}

async function create(req, res) {
  const { name_en, name_ar, description_en, description_ar } = req.body;
  const slug = name_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  await pool.query(
    `INSERT INTO services (uuid, slug, name_en, name_ar, description_en, description_ar, is_active)
     VALUES (UUID(), ?, ?, ?, ?, ?, 1)`,
    [slug, name_en, name_ar, description_en, description_ar]
  );
  res.json({ success: true, message: 'Service created' });
}

async function update(req, res) {
  const { id } = req.params; 
  const { name_en, name_ar, description_en, description_ar, is_active } = req.body;
  
  await pool.query(
    `UPDATE services SET 
      name_en = COALESCE(?, name_en), 
      name_ar = COALESCE(?, name_ar), 
      description_en = COALESCE(?, description_en), 
      description_ar = COALESCE(?, description_ar), 
      is_active = COALESCE(?, is_active)
     WHERE uuid = ?`,
    [name_en, name_ar, description_en, description_ar, is_active, id]
  );
  res.json({ success: true, message: 'Service updated' });
}

async function remove(req, res) {
  const { id } = req.params;
  const [[s]] = await pool.query('SELECT id, name_en, name_ar FROM services WHERE uuid = ? OR id = ?', [id, id]);
  if (s) {
    await pool.query('DELETE FROM warranties WHERE service_name LIKE ? OR service_name LIKE ?', [`%${s.name_en}%`, `%${s.name_ar}%`]);
    await pool.query('DELETE FROM appointments WHERE service_id = ?', [s.id]);
    await pool.query('DELETE FROM services WHERE id = ?', [s.id]);
  }
  res.json({ success: true, message: 'Service deleted' });
}

module.exports = { getAll, create, update, remove };

