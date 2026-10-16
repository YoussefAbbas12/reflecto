const { pool } = require('../config/database');

const parseJSON = (data, defaultVal = []) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

/**
 * Helper to check if a work order is assigned to a specific technician
 */
function isOrderAssignedToTechnician(r, techId, techUuid, techName) {
  const tId = techId ? String(techId).trim().toLowerCase() : '';
  const tUuid = techUuid ? String(techUuid).trim().toLowerCase() : '';
  const tName = techName ? String(techName).trim().toLowerCase() : '';

  const matchesTech = (val) => {
    if (val === null || val === undefined || val === '') return false;
    const s = String(val).trim().toLowerCase();
    return (tId && s === tId) || (tUuid && s === tUuid) || (tName && s === tName);
  };

  // 1. Overall technician_id or technician_name matches
  if (matchesTech(r.technician_id) || matchesTech(r.technician_name)) {
    return true;
  }

  // 2. Check per-service technicians object
  const serviceTechs = parseJSON(r.service_technicians, {});
  if (serviceTechs && typeof serviceTechs === 'object') {
    const keys = Object.keys(serviceTechs);
    let hasAnyAssignments = false;
    for (const k of keys) {
      if (serviceTechs[k]) {
        hasAnyAssignments = true;
        if (matchesTech(serviceTechs[k])) {
          return true;
        }
      }
    }
    if (hasAnyAssignments) {
      return false;
    }
  }

  // 3. If order is completely unassigned (no technician specified), visible to all technicians
  const isCompletelyUnassigned = !r.technician_id && !r.technician_name;
  if (isCompletelyUnassigned) {
    return true;
  }

  return false;
}

/**
 * Helper to check if ALL services assigned to a specific technician in a work order are completed
 */
function isTechWorkCompletedForOrder(r, techId, techUuid, techName) {
  const tId = techId ? String(techId).trim().toLowerCase() : '';
  const tUuid = techUuid ? String(techUuid).trim().toLowerCase() : '';
  const tName = techName ? String(techName).trim().toLowerCase() : '';

  const matchesTech = (val) => {
    if (val === null || val === undefined || val === '') return false;
    const s = String(val).trim().toLowerCase();
    return (tId && s === tId) || (tUuid && s === tUuid) || (tName && s === tName);
  };

  const ALL_KEYS = ['heat_insulation', 'polishing', 'nano_ceramic', 'ppf', 'removal_services'];
  const serviceTechs = parseJSON(r.service_technicians, {});
  const progressObj = parseJSON(r.service_progress, {});

  let assignedCount = 0;
  let completedCount = 0;

  ALL_KEYS.forEach(k => {
    const rawVal = r[k];
    const list = parseJSON(rawVal, []);
    const hasItems = (Array.isArray(list) && list.length > 0) || (typeof rawVal === 'string' && rawVal.trim().length > 0);
    if (!hasItems) return;

    const assignedTechId = serviceTechs?.[k];
    const isAssignedToThisTech = assignedTechId
      ? matchesTech(assignedTechId)
      : (matchesTech(r.technician_id) || matchesTech(r.technician_name) || (!r.technician_id && !r.technician_name));

    if (isAssignedToThisTech) {
      assignedCount++;
      if (progressObj?.[k]?.completed) {
        completedCount++;
      }
    }
  });

  if (assignedCount === 0) return false;
  return completedCount === assignedCount;
}

/**
 * Get work orders assigned to the currently logged in technician
 */
async function getAssignedOrders(req, res) {
  try {
    const techId = req.user.id;
    const techUuid = req.user.uuid || String(techId);
    const techName = req.user.full_name || '';

    const [rows] = await pool.query(
      `SELECT * FROM work_orders 
       WHERE status IN ('pending', 'in_progress')
       ORDER BY created_at DESC`
    );

    const formatted = rows
      .filter(r => isOrderAssignedToTechnician(r, techId, techUuid, techName))
      .filter(r => !isTechWorkCompletedForOrder(r, techId, techUuid, techName))
      .map(r => ({
        ...r,
        branch_name: r.branch_name || 'فرع جدة',
        heat_insulation: parseJSON(r.heat_insulation),
        heat_insulation_details: parseJSON(r.heat_insulation_details, {}),
        polishing: parseJSON(r.polishing),
        nano_ceramic: parseJSON(r.nano_ceramic),
        ppf: parseJSON(r.ppf),
        removal_services: parseJSON(r.removal_services),
        inspection_checklist: parseJSON(r.inspection_checklist, {}),
        service_progress: parseJSON(r.service_progress, {}),
        service_technicians: parseJSON(r.service_technicians, {}),
        price: parseFloat(r.price || 0),
        total_amount: parseFloat(r.total_amount || 0),
        paid_amount: parseFloat(r.paid_amount || 0),
        remaining_amount: parseFloat(r.remaining_amount || 0),
      }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Get assigned technician orders error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Update service progress checklist for a work order
 */
async function updateServiceProgress(req, res) {
  try {
    const { id } = req.params;
    const { service_key, completed, service_progress, overall_status } = req.body;

    const [[wo]] = await pool.query(
      'SELECT * FROM work_orders WHERE (uuid = ? OR id = ?)',
      [id, id]
    );

    if (!wo) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work Order not found' } });
    }

    let progressObj = parseJSON(wo.service_progress, {});

    if (service_progress && typeof service_progress === 'object') {
      progressObj = service_progress;
    } else if (service_key) {
      const now = new Date().toISOString();
      const currentItem = progressObj[service_key] || {};
      progressObj[service_key] = {
        ...currentItem,
        completed: Boolean(completed),
        started_at: currentItem.started_at || (completed ? now : null),
        completed_at: completed ? now : null
      };
    }

    const updates = ['service_progress = ?'];
    const params = [JSON.stringify(progressObj)];

    // Set order started_at if not set
    if (!wo.started_at) {
      updates.push('started_at = NOW()');
    }

    // Status logic: Technicians move status to in_progress when starting/toggling, but NEVER to completed
    if (wo.status === 'pending' || overall_status === 'in_progress') {
      updates.push("status = 'in_progress'");
    }

    params.push(wo.id);
    await pool.query(`UPDATE work_orders SET ${updates.join(', ')} WHERE id = ?`, params);

    // Sync to system (appointments/payments/points/warranties) asynchronously to keep UI fast
    const [[updatedWO]] = await pool.query('SELECT * FROM work_orders WHERE id = ?', [wo.id]);
    setImmediate(async () => {
      try {
        const { syncWorkOrderToSystem, syncWorkOrderWarranties } = require('./orders.controller');
        if (syncWorkOrderToSystem) await syncWorkOrderToSystem(updatedWO);
        if (syncWorkOrderWarranties) await syncWorkOrderWarranties(updatedWO.id, updatedWO.status === 'completed');
      } catch (err) {
        console.error('Background sync error in updateServiceProgress:', err.message);
      }
    });

    res.json({
      success: true,
      message: 'Service progress updated successfully',
      data: {
        service_progress: progressObj,
        status: updatedWO.status,
        started_at: updatedWO.started_at,
        completed_at: updatedWO.completed_at
      }
    });
  } catch (err) {
    console.error('Update service progress error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Get completed services history for technician
 */
async function getCompletedHistory(req, res) {
  try {
    const techId = req.user.id;
    const techUuid = req.user.uuid || String(techId);
    const techName = req.user.full_name || '';

    const [rows] = await pool.query(
      `SELECT * FROM work_orders 
       ORDER BY created_at DESC`
    );

    const formatted = rows
      .filter(r => isOrderAssignedToTechnician(r, techId, techUuid, techName))
      .filter(r => r.status === 'completed' || isTechWorkCompletedForOrder(r, techId, techUuid, techName))
      .map(r => ({
        ...r,
        branch_name: r.branch_name || 'فرع جدة',
        heat_insulation: parseJSON(r.heat_insulation),
        heat_insulation_details: parseJSON(r.heat_insulation_details, {}),
        polishing: parseJSON(r.polishing),
        nano_ceramic: parseJSON(r.nano_ceramic),
        ppf: parseJSON(r.ppf),
        removal_services: parseJSON(r.removal_services),
        inspection_checklist: parseJSON(r.inspection_checklist, {}),
        service_progress: parseJSON(r.service_progress, {}),
        service_technicians: parseJSON(r.service_technicians, {}),
        price: parseFloat(r.price || 0),
        total_amount: parseFloat(r.total_amount || 0),
        paid_amount: parseFloat(r.paid_amount || 0),
        remaining_amount: parseFloat(r.remaining_amount || 0),
      }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Get technician history error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Helper to fetch commissions summary and list for any technician
 */
async function getCommissionsForTech(techId) {
  const [rows] = await pool.query(
    `SELECT 
       tc.id, tc.uuid, tc.service_name, tc.amount, tc.currency, 
       tc.vehicle_info, tc.vehicle_plate, tc.client_name, tc.branch_name, 
       tc.notes, tc.status, tc.created_at,
       a.uuid AS appointment_uuid,
       wo.work_order_number
     FROM technician_commissions tc
     LEFT JOIN appointments a ON a.id = tc.appointment_id
     LEFT JOIN work_orders wo ON wo.id = tc.work_order_id
     WHERE tc.technician_id = ?
     ORDER BY tc.created_at DESC`,
    [techId]
  );

  const totalEarned = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  return {
    commissions: rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount) || 0,
      currency: r.currency || 'SAR',
    })),
    total_earned: totalEarned,
    services_count: rows.length,
  };
}

/**
 * Helper to fetch all commissions for admin overview / preview
 */
async function getAllCommissionsForAdmin() {
  const [rows] = await pool.query(
    `SELECT 
       tc.id, tc.uuid, tc.service_name, tc.amount, tc.currency, 
       tc.vehicle_info, tc.vehicle_plate, tc.client_name, tc.branch_name, 
       tc.notes, tc.status, tc.created_at,
       u.full_name AS technician_name,
       a.uuid AS appointment_uuid,
       wo.work_order_number
     FROM technician_commissions tc
     LEFT JOIN users u ON u.id = tc.technician_id
     LEFT JOIN appointments a ON a.id = tc.appointment_id
     LEFT JOIN work_orders wo ON wo.id = tc.work_order_id
     ORDER BY tc.created_at DESC`
  );

  const totalEarned = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  return {
    commissions: rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount) || 0,
      currency: r.currency || 'SAR',
    })),
    total_earned: totalEarned,
    services_count: rows.length,
  };
}

/**
 * Get commissions for the logged in technician (or admin preview)
 */
async function getTechnicianCommissions(req, res) {
  try {
    const techId = req.user.id;
    let data = await getCommissionsForTech(techId);

    // If an Admin/SuperAdmin is previewing the technician dashboard and has no personal commissions
    if ((req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.is_super_admin) && data.services_count === 0) {
      data = await getAllCommissionsForAdmin();
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Get technician commissions error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Get commissions for a specific technician by admin
 */
async function getTechnicianCommissionsByAdmin(req, res) {
  try {
    const { id } = req.params;
    const [[tech]] = await pool.query(
      'SELECT id, uuid, full_name, phone, branch_name, role FROM users WHERE (uuid = ? OR id = ?)',
      [id, id]
    );

    if (!tech) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const commissionData = await getCommissionsForTech(tech.id);
    res.json({
      success: true,
      data: {
        technician: {
          id: tech.uuid,
          internal_id: tech.id,
          full_name: tech.full_name,
          phone: tech.phone,
          branch_name: tech.branch_name || 'فرع جدة',
        },
        ...commissionData,
      },
    });
  } catch (err) {
    console.error('Get technician commissions by admin error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = {
  getAssignedOrders,
  updateServiceProgress,
  getCompletedHistory,
  getTechnicianCommissions,
  getTechnicianCommissionsByAdmin
};
