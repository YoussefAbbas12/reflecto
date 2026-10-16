const { pool } = require('../config/database');

function calcProgress(preferredDate, estimatedDelivery, status, dbProgress) {
  if (status === 'completed') return 100;
  if (status === 'pending') return 0;
  return dbProgress !== undefined && dbProgress !== null ? parseInt(dbProgress) : 0;
}

async function getAll(req, res) {
  try {
    const { date, status, technician_id } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (date) { where += ' AND DATE(a.preferred_date) = ?'; params.push(date); }
    if (status) { where += ' AND a.status = ?'; params.push(status); }
    if (technician_id) {
      where += ' AND (tech.uuid = ? OR tech.id = ?)';
      params.push(technician_id, technician_id);
    }

    const buildQuery = (hasCommColumn) => `
      SELECT
         a.uuid, a.status, a.progress, a.price, a.currency, a.bay_number,
         ${hasCommColumn ? 'COALESCE(a.technician_commission, 0) AS technician_commission' : '0.00 AS technician_commission'},
         a.points_earned, a.estimated_delivery, a.notes,
         a.has_warranty, a.warranty_years, a.warranty_start_date, a.warranty_end_date,
         DATE_FORMAT(a.preferred_date, '%Y-%m-%d') AS preferred_date,
         TIME_FORMAT(a.preferred_time, '%H:%i')    AS preferred_time,
         u.uuid AS client_uuid, u.full_name AS client_name, u.phone AS client_phone,
         v.uuid AS vehicle_uuid, v.brand, v.model, v.year,
         s.uuid AS service_uuid, s.name_en AS service,
         pt.name_en AS pricing_tier,
         tech.uuid AS tech_uuid, tech.full_name AS technician_name
       FROM appointments a
       JOIN users u       ON u.id = a.client_id
       LEFT JOIN vehicles v   ON v.id = a.vehicle_id
       LEFT JOIN services s   ON s.id = a.service_id
       LEFT JOIN pricing_tiers pt ON pt.id = a.pricing_tier_id
       LEFT JOIN users tech    ON tech.id = a.technician_id
       ${where}
       ORDER BY a.preferred_date DESC, a.preferred_time ASC
    `;

    let rows;
    try {
      const [result] = await pool.query(buildQuery(true), params);
      rows = result;
    } catch (queryErr) {
      // Fallback: column may not exist yet in production
      if (queryErr.code === 'ER_BAD_FIELD_ERROR' || (queryErr.message && queryErr.message.includes('technician_commission'))) {
        const [fallback] = await pool.query(buildQuery(false), params);
        rows = fallback;
      } else {
        throw queryErr;
      }
    }

    res.json({
      data: rows.map((r) => ({
        id: r.uuid,
        status: r.status,
        progress: calcProgress(r.preferred_date, r.estimated_delivery, r.status, r.progress),
        price: parseFloat(r.price || 0),
        currency: r.currency || 'SAR',
        bay_number: r.bay_number,
        points_earned: r.points_earned || 0,
        estimated_delivery: r.estimated_delivery,
        notes: r.notes,
        technician_commission: parseFloat(r.technician_commission || 0),
        has_warranty: Boolean(r.has_warranty),
        warranty_years: r.warranty_years || 0,
        warranty_start_date: r.warranty_start_date,
        warranty_end_date: r.warranty_end_date,
        preferred_date: r.preferred_date,
        preferred_time: r.preferred_time,
        client: { id: r.client_uuid, full_name: r.client_name, phone: r.client_phone },
        vehicle: { id: r.vehicle_uuid, brand: r.brand, model: r.model, year: r.year },
        service: r.service,
        pricing_tier: r.pricing_tier,
        technician: r.tech_uuid ? { id: r.tech_uuid, full_name: r.technician_name } : null,
      })),
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function create(req, res) {
  const {
    client_id, vehicle_id, service_id, pricing_tier_id,
    preferred_date, preferred_time, bay_number, technician_id,
    price, currency, notes,
  } = req.body;

  if (!client_id || !vehicle_id || !service_id || !preferred_date || !price) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'client_id, vehicle_id, service_id, preferred_date, price are required' },
    });
  }

  // جيب الـ internal IDs من الـ UUIDs
  const [[client]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [client_id, client_id]);
  const [[vehicle]] = await pool.query('SELECT id FROM vehicles WHERE (uuid = ? OR id = ?)', [vehicle_id, vehicle_id]);
  const [[service]] = await pool.query('SELECT id FROM services WHERE (uuid = ? OR id = ?)', [service_id, service_id]);
  if (!client || !vehicle || !service) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client, Vehicle, or Service not found' } });
  }

  let tierId = null;
  let warrantyYears = 0;
  if (pricing_tier_id) {
    const [[tier]] = await pool.query('SELECT id, warranty_years FROM pricing_tiers WHERE (uuid = ? OR id = ?)', [pricing_tier_id, pricing_tier_id]);
    if (tier) { tierId = tier.id; warrantyYears = tier.warranty_years || 0; }
  }

  let techId = null;
  if (technician_id) {
    const [[tech]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?) AND role = ?', [technician_id, technician_id, 'technician']);
    if (tech) techId = tech.id;
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [result] = await conn.query(
      `INSERT INTO appointments
         (client_id, vehicle_id, service_id, pricing_tier_id, preferred_date, preferred_time,
          bay_number, technician_id, price, currency, notes, uuid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
      [client.id, vehicle.id, service.id, tierId, preferred_date, preferred_time || null,
      bay_number || null, techId, price, currency || 'SAR', notes || null]
    );

    const apptId = result.insertId;

    // اعمل ضمان تلقائياً لو فيه سنوات ضمان
    if (warrantyYears > 0) {
      const [[srv]] = await conn.query('SELECT name_en FROM services WHERE id = ?', [service.id]);
      await conn.query(
        `INSERT INTO warranties
           (appointment_id, client_id, vehicle_id, service_name, start_date, coverage_years, expiry_date, uuid)
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL ? YEAR), UUID())`,
        [apptId, client.id, vehicle.id, srv.name_en, preferred_date, warrantyYears, preferred_date, warrantyYears]
      );
    }

    await conn.query(
      `INSERT INTO activity_log (actor_id, action, target_type, target_id, description)
       VALUES (?, 'appointment.created', 'appointment', ?, 'New appointment created')`,
      [req.user?.id || null, apptId]
    );

    const [[newAppt]] = await conn.query('SELECT uuid FROM appointments WHERE id = ?', [apptId]);

    await conn.commit();
    res.status(201).json({ success: true, id: newAppt.uuid, status: 'pending', created_at: new Date() });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function update(req, res) {
  try {
  const { id } = req.params;
  const { status, progress, bay_number, technician_id, estimated_delivery, notes, preferred_date, preferred_time, has_warranty, warranty_years, technician_commission } = req.body;

  const [[appt]] = await pool.query(
    `SELECT a.id, a.client_id, a.vehicle_id, a.service_id, a.price, a.preferred_date, a.status AS old_status, a.technician_id, a.technician_commission, s.name_en AS service_name, s.name_ar AS service_name_ar
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE (a.uuid = ? OR a.id = ?)`,
    [id, id]
  );
  if (!appt) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
  }

  let techId = null;
  if (technician_id) {
    const [[tech]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [technician_id, technician_id]);
    if (tech) techId = tech.id;
  }

  const updates = [];
  const queryParams = [];

  if (status !== undefined) { updates.push('status = ?'); queryParams.push(status); }
  if (progress !== undefined && progress !== null) { updates.push('progress = ?'); queryParams.push(parseInt(progress) || 0); }
  if (bay_number !== undefined) { updates.push('bay_number = ?'); queryParams.push(bay_number || null); }
  if (technician_id !== undefined) { updates.push('technician_id = ?'); queryParams.push(techId); }
  if (technician_commission !== undefined) { updates.push('technician_commission = ?'); queryParams.push(parseFloat(technician_commission) || 0); }
  if (estimated_delivery !== undefined) { updates.push('estimated_delivery = ?'); queryParams.push(estimated_delivery || null); }
  if (notes !== undefined) { updates.push('notes = ?'); queryParams.push(notes || null); }
  if (preferred_date !== undefined) { updates.push('preferred_date = ?'); queryParams.push(preferred_date || null); }
  if (preferred_time !== undefined) { updates.push('preferred_time = ?'); queryParams.push(preferred_time || null); }

  const yearsNum = parseInt(warranty_years || 0);
  if (has_warranty !== undefined) {
    updates.push('has_warranty = ?'); queryParams.push(has_warranty ? 1 : 0);
    if (yearsNum > 0) {
      updates.push('warranty_years = ?'); queryParams.push(yearsNum);
    }

    // Check for linked work order in appointment notes
    let woId = null;
    const currentNotes = notes !== undefined ? notes : appt.notes;
    if (currentNotes) {
      const match = currentNotes.match(/WO-\d+/i);
      if (match) {
        const [[wo]] = await pool.query('SELECT id FROM work_orders WHERE work_order_number = ?', [match[0]]);
        if (wo) woId = wo.id;
      }
    }

    if (has_warranty) {
      await pool.query('UPDATE warranties SET is_active = 1 WHERE client_id = ? OR appointment_id = ?', [appt.client_id, appt.id]).catch(() => {});
      if (woId) {
        await pool.query('UPDATE warranties SET is_active = 1 WHERE work_order_id = ?', [woId]).catch(() => {});
        await pool.query('UPDATE work_orders SET has_warranty = 1 WHERE id = ?', [woId]).catch(() => {});
      }
      const [existingW] = await pool.query('SELECT id FROM warranties WHERE client_id = ? OR appointment_id = ? OR work_order_id = ?', [appt.client_id, appt.id, woId || 0]);
      if (!existingW.length) {
        const finalYears = yearsNum > 0 ? yearsNum : 1;
        const deliveryDate = estimated_delivery || appt.estimated_delivery;
        const startDate = deliveryDate ? new Date(deliveryDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        const startDt = new Date(startDate);
        startDt.setFullYear(startDt.getFullYear() + finalYears);
        const endDate = startDt.toISOString().slice(0, 10);
        updates.push('warranty_start_date = ?'); queryParams.push(startDate);
        updates.push('warranty_end_date = ?'); queryParams.push(endDate);

        const SERVICE_NAMES_MAP = {
          'Paint Protection Film': 'حماية الطلاء PPF (Paint Protection Film)',
          'Tint': 'عازل حراري (Heat Insulation)',
          'Thermal Insulation': 'عازل حراري (Heat Insulation)',
          'Nano Ceramic': 'نانو سيراميك (Nano Ceramic)',
          'Paint Correction': 'تعديل وتلميع الطلاء (Paint Correction)',
          'Polishing': 'تلميع خارجي (External Polishing)',
        };
        const sName = SERVICE_NAMES_MAP[appt.service_name] || appt.service_name || 'خدمة حماية وعناية بالسيارة';
        await pool.query(
          `INSERT INTO warranties (uuid, appointment_id, client_id, vehicle_id, service_name, start_date, coverage_years, expiry_date, is_active)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 1)`,
          [appt.id, appt.client_id, appt.vehicle_id || null, sName, startDate, finalYears, endDate]
        ).catch(e => console.error('Warranty insert note:', e.message));
      }
    } else {
      await pool.query('UPDATE warranties SET is_active = 0 WHERE client_id = ? OR appointment_id = ?', [appt.client_id, appt.id]).catch(() => {});
      if (woId) {
        await pool.query('UPDATE warranties SET is_active = 0 WHERE work_order_id = ?', [woId]).catch(() => {});
        await pool.query('UPDATE work_orders SET has_warranty = 0 WHERE id = ?', [woId]).catch(() => {});
      }
    }
  }

  if (updates.length > 0) {
    queryParams.push(id, id);
    await pool.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE (uuid = ? OR id = ?)`,
      queryParams
    );
  }

  // Bi-directional sync: If status was updated by Admin, sync status to linked work_order
  if (status !== undefined) {
    let targetWoId = null;
    const currentNotes = notes !== undefined ? notes : appt.notes;
    if (currentNotes) {
      const match = currentNotes.match(/WO-\d+/i);
      if (match) {
        const [[woRow]] = await pool.query('SELECT id FROM work_orders WHERE work_order_number = ?', [match[0]]);
        if (woRow) targetWoId = woRow.id;
      }
    }
    if (!targetWoId && appt.client_id) {
      const [[woRow]] = await pool.query(
        'SELECT wo.id FROM work_orders wo JOIN users u ON u.id = ? WHERE (u.phone = wo.client_phone OR wo.client_phone LIKE CONCAT("%", RIGHT(REGEXP_REPLACE(u.phone, "[^0-9]", ""), 9))) ORDER BY wo.id DESC LIMIT 1',
        [appt.client_id]
      );
      if (woRow) targetWoId = woRow.id;
    }

    if (targetWoId) {
      const woUpdates = ['status = ?'];
      const woParams = [status];
      if (status === 'completed') {
        woUpdates.push('completed_at = COALESCE(completed_at, NOW())');
      } else if (status === 'in_progress') {
        woUpdates.push('started_at = COALESCE(started_at, NOW())');
      }
      woParams.push(targetWoId);
      await pool.query(`UPDATE work_orders SET ${woUpdates.join(', ')} WHERE id = ?`, woParams).catch(() => {});

      const { syncWorkOrderWarranties } = require('./orders.controller');
      if (syncWorkOrderWarranties) {
        await syncWorkOrderWarranties(targetWoId, status === 'completed');
      }
    }
  }

  // Technician commission synchronization
  const finalTechId = techId !== null && technician_id !== undefined ? techId : appt.technician_id;
  const finalCommAmount = technician_commission !== undefined ? parseFloat(technician_commission) || 0 : parseFloat(appt.technician_commission || 0);
  const finalStatus = status !== undefined ? status : appt.old_status;

  if (finalTechId) {
    try {
      let vehicleInfo = 'سيارة العميل';
      let vehiclePlate = '';
      if (appt.vehicle_id) {
        const [[veh]] = await pool.query('SELECT brand, model, year, plate FROM vehicles WHERE id = ?', [appt.vehicle_id]);
        if (veh) {
          vehicleInfo = `${veh.brand || ''} ${veh.model || ''} ${veh.year || ''}`.trim() || 'سيارة العميل';
          vehiclePlate = veh.plate || '';
        }
      }

      let clientName = '';
      let branchName = 'فرع جدة';
      if (appt.client_id) {
        const [[cli]] = await pool.query('SELECT full_name, phone, branch_name FROM users WHERE id = ?', [appt.client_id]);
        if (cli) {
          clientName = cli.full_name || '';
          branchName = cli.branch_name || 'فرع جدة';
        }
      }

      let svcName = '';
      if (targetWoId) {
        const [[woRow]] = await pool.query(
          'SELECT heat_insulation, polishing, nano_ceramic, ppf, removal_services, service_technicians, vehicle_type, vehicle_model, vehicle_year, vehicle_plate FROM work_orders WHERE id = ?',
          [targetWoId]
        );
        if (woRow) {
          if (vehicleInfo === 'سيارة العميل' && (woRow.vehicle_type || woRow.vehicle_model)) {
            vehicleInfo = `${woRow.vehicle_type || ''} ${woRow.vehicle_model || ''} ${woRow.vehicle_year || ''}`.trim();
          }
          if (!vehiclePlate && woRow.vehicle_plate) {
            vehiclePlate = woRow.vehicle_plate;
          }

          const SERVICE_MAP = {
            polishing: 'تلميع ساطع',
            ppf: 'حماية PPF',
            nano_ceramic: 'نانو سيراميك',
            heat_insulation: 'عازل حراري',
            removal_services: 'خدمات إزالة',
          };

          let serviceTechs = {};
          try {
            serviceTechs = typeof woRow.service_technicians === 'object' ? woRow.service_technicians : JSON.parse(woRow.service_technicians || '{}');
          } catch (e) {}

          const [[techUser]] = await pool.query('SELECT uuid FROM users WHERE id = ?', [finalTechId]);
          const techUuid = techUser?.uuid;

          const matched = [];
          for (const [k, label] of Object.entries(SERVICE_MAP)) {
            let list = [];
            try {
              list = typeof woRow[k] === 'object' ? woRow[k] : JSON.parse(woRow[k] || '[]');
            } catch (e) {}
            if (Array.isArray(list) && list.length > 0) {
              const assigned = serviceTechs?.[k];
              if (!assigned || assigned === String(finalTechId) || (techUuid && assigned === techUuid)) {
                matched.push(label);
              }
            }
          }

          if (matched.length > 0) {
            svcName = matched.join(' + ');
          }
        }
      }

      if (!svcName) {
        svcName = appt.service_name_ar || appt.service_name || 'خدمة حماية وتلميع';
      }

      const [existingComm] = await pool.query('SELECT id FROM technician_commissions WHERE appointment_id = ?', [appt.id]);
      if (finalCommAmount > 0) {
        if (existingComm.length > 0) {
          await pool.query(
            `UPDATE technician_commissions 
             SET technician_id = ?, work_order_id = COALESCE(?, work_order_id), amount = ?, service_name = ?, vehicle_info = ?, vehicle_plate = ?, client_name = ?, branch_name = ?, status = ?
             WHERE appointment_id = ?`,
            [finalTechId, targetWoId || null, finalCommAmount, svcName, vehicleInfo, vehiclePlate, clientName, branchName, finalStatus, appt.id]
          );
        } else {
          await pool.query(
            `INSERT INTO technician_commissions 
             (uuid, technician_id, appointment_id, work_order_id, service_name, amount, currency, vehicle_info, vehicle_plate, client_name, branch_name, status)
             VALUES (UUID(), ?, ?, ?, ?, ?, 'SAR', ?, ?, ?, ?, ?)`,
            [finalTechId, appt.id, targetWoId || null, svcName, finalCommAmount, vehicleInfo, vehiclePlate, clientName, branchName, finalStatus]
          );
        }
      } else if (existingComm.length > 0) {
        await pool.query('DELETE FROM technician_commissions WHERE appointment_id = ?', [appt.id]);
      }
    } catch (syncErr) {
      console.error('Error syncing technician commission:', syncErr);
    }
  }

  // If status changed to completed -> handle loyalty points
  if (status === 'completed' && appt.old_status !== 'completed') {
    await handleCompleted(appt.id, appt.client_id, parseFloat(appt.price));
  }

  res.json({ success: true, message: 'Appointment updated' });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function handleCompleted(apptId, clientId, price) {
  await pool.query(
    `INSERT INTO activity_log (action, target_type, target_id, description)
     VALUES ('appointment.completed', 'appointment', ?, 'Service completed')`,
    [apptId]
  );
}

async function cancel(req, res) {
  try {
    const { id } = req.params;
    const [[appt]] = await pool.query('SELECT id FROM appointments WHERE uuid = ? OR id = ?', [id, id]);
    if (!appt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    await pool.query("UPDATE appointments SET status = 'cancelled' WHERE uuid = ? OR id = ?", [id, id]);

    await pool.query(
      `INSERT INTO activity_log (action, target_type, target_id, description)
       VALUES ('appointment.cancelled', 'appointment', ?, 'Appointment cancelled')`,
      [appt.id]
    );

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [[appt]] = await conn.query('SELECT id, client_id FROM appointments WHERE uuid = ? OR id = ?', [id, id]);
    if (!appt) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    await conn.query('DELETE FROM warranties WHERE appointment_id = ? OR (client_id = ? AND work_order_id IS NULL)', [appt.id, appt.client_id]);
    await conn.query('UPDATE payments SET appointment_id = NULL WHERE appointment_id = ?', [appt.id]);
    await conn.query('DELETE FROM appointments WHERE id = ?', [appt.id]);

    await conn.commit();
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Delete appointment error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  } finally {
    conn.release();
  }
}

module.exports = { getAll, create, update, cancel, remove };
