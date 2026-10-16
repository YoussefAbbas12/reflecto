const { pool } = require('../config/database');

function calcTimeRemaining(estimatedDelivery) {
  if (!estimatedDelivery) return null;
  const diffMs = new Date(estimatedDelivery) - new Date();
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 };
  const totalMinutes = Math.floor(diffMs / 60000);
  const days    = Math.floor(totalMinutes / 1440);
  const hours   = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

function calcProgress(preferredDate, estimatedDelivery, status, dbProgress) {
  if (status === 'completed') return 100;
  if (status === 'pending') return 0;
  
  const manualProgress = parseInt(dbProgress || 0);
  if (manualProgress > 0) {
    return manualProgress;
  }

  if (status === 'in_progress' && estimatedDelivery) {
    const start = preferredDate ? new Date(preferredDate).getTime() : Date.now() - 3600000;
    const end = new Date(estimatedDelivery).getTime();
    const now = Date.now();
    if (end > start) {
      const timePercent = Math.floor(((now - start) / (end - start)) * 100);
      return Math.min(99, Math.max(0, timePercent, 5));
    }
  }
  return 0;
}

function calcLoyaltyMeta(totalPoints) {
  return {
    can_redeem: totalPoints >= 1,
  };
}

async function getMe(req, res) {
  const userId = req.user.id;
  const rawUserPhone = req.user?.phone ? String(req.user.phone).replace(/\D/g, '') : '';
  const cleanPhone = rawUserPhone ? rawUserPhone.slice(-9) : '';

  let company = null;
  if (req.user.company_id) {
    const [[companyRow]] = await pool.query(
      'SELECT id, name, logo_url, custom_message, discount_percent FROM companies WHERE id = ?',
      [req.user.company_id]
    );
    company = companyRow || null;
  }

  // المواعيد الحالية - تشمل in_progress, confirmed, pending وكذلك completed/delivered حتى يرى العميل حالة سيارته
  const [activeAppt] = await pool.query(
    `SELECT
       a.id, a.id AS appt_id, a.uuid, a.status, a.progress, a.estimated_delivery, a.preferred_date, a.preferred_time, a.notes,
       a.price, a.price AS total_amount, a.price AS paid_amount, 0 AS remaining_amount, 0 AS is_work_order, a.currency, a.points_earned,
       COALESCE(a.warranty_years, 0) AS warranty_years,
       COALESCE(a.has_warranty, 0) AS has_warranty,
       a.warranty_end_date,
       s.name_en AS service_name,
       pt.name_en AS tier_name,
       v.brand, v.model, v.year
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     JOIN vehicles  v ON v.id = a.vehicle_id
     LEFT JOIN pricing_tiers pt ON pt.id = a.pricing_tier_id
     WHERE a.client_id = ? AND a.status IN ('in_progress', 'confirmed', 'pending', 'completed', 'delivered', 'ready')
     ORDER BY
       CASE a.status
         WHEN 'in_progress' THEN 1
         WHEN 'confirmed'   THEN 2
         WHEN 'pending'     THEN 3
         WHEN 'completed'   THEN 4
         WHEN 'ready'       THEN 4
         WHEN 'delivered'   THEN 5
         ELSE 6
       END ASC,
       a.preferred_date DESC
     LIMIT 5`,
    [userId]
  );

  if (req.user?.phone || userId) {
    const rawUserPhone = req.user?.phone ? String(req.user.phone).replace(/\D/g, '') : '';
    const cleanPhone = rawUserPhone ? rawUserPhone.slice(-9) : '';
    const [woActive] = await pool.query(
      `SELECT id, uuid, work_order_number, client_name, client_phone, total_amount, paid_amount, remaining_amount,
              vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, chassis_number, mileage_km,
              status, delivery_date, order_date, payment_method, technician_name, service_progress,
              started_at, completed_at, heat_insulation, polishing, nano_ceramic, ppf, removal_services,
              inspection_notes, service_technicians
       FROM work_orders
       WHERE (client_phone LIKE ? OR client_phone LIKE ?) AND status != 'delivered'
       ORDER BY id DESC`,
      [`%${cleanPhone}%`, `%${rawUserPhone}%`]
    );
      for (const wo of woActive) {
        const parseJSON = (data, defaultVal = []) => {
          if (!data) return defaultVal;
          let res = data;
          if (typeof res === 'string') {
            try { res = JSON.parse(res); } catch { return defaultVal; }
          }
          if (typeof res === 'string') {
            try { res = JSON.parse(res); } catch { return defaultVal; }
          }
          return res || defaultVal;
        };

        const existing = activeAppt.find(a =>
          a.uuid === wo.uuid ||
          (a.notes && wo.work_order_number && a.notes.includes(wo.work_order_number))
        );

        const progressObj = parseJSON(wo.service_progress, {});

        // Calculate progress percentage from service_progress checklist
        const ALL_KEYS = ['heat_insulation', 'polishing', 'nano_ceramic', 'ppf', 'removal_services'];
        let totalItems = 0;
        let doneItems = 0;
        ALL_KEYS.forEach(k => {
          const list = parseJSON(wo[k]);
          if (Array.isArray(list) && list.length > 0) {
            totalItems += 1;
            if (progressObj[k]?.completed) doneItems += 1;
          }
        });

        const woStatus = (wo.status === 'delivered') ? 'completed' : wo.status;
        let calcProgress = 0;
        if (woStatus === 'completed') {
          calcProgress = 100;
        } else if (woStatus === 'ready') {
          calcProgress = 95;
        } else if (totalItems > 0) {
          if (doneItems === totalItems) {
            calcProgress = 90;
          } else {
            calcProgress = Math.round((doneItems / totalItems) * 90);
          }
        } else {
          calcProgress = woStatus === 'in_progress' ? 50 : 0;
        }

        if (existing) {
          existing.wo_id = wo.id;
          existing.status = woStatus;
          existing.progress = calcProgress;
          existing.total_amount = parseFloat(wo.total_amount || 0);
          existing.paid_amount = parseFloat(wo.paid_amount || 0);
          existing.remaining_amount = parseFloat(wo.remaining_amount || 0);
          existing.is_work_order = true;
          existing.work_order_number = wo.work_order_number;
          existing.wo_uuid = wo.uuid;
          existing.payment_method = wo.payment_method || null;
          existing.technician_name = wo.technician_name || null;
          existing.service_progress = progressObj;
          existing.service_technicians = parseJSON(wo.service_technicians, {});
          existing.estimated_delivery = wo.delivery_date || existing.estimated_delivery || null;
          existing.started_at = wo.started_at || null;
          existing.completed_at = wo.completed_at || null;
          existing.vehicle_color = wo.vehicle_color || null;
          existing.chassis_number = wo.chassis_number || null;
          existing.mileage_km = wo.mileage_km || null;
          existing.heat_insulation = parseJSON(wo.heat_insulation);
          existing.polishing = parseJSON(wo.polishing);
          existing.nano_ceramic = parseJSON(wo.nano_ceramic);
          existing.ppf = parseJSON(wo.ppf);
          existing.removal_services = parseJSON(wo.removal_services);
          existing.inspection_notes = wo.inspection_notes || null;
          if (wo.vehicle_type) existing.brand = wo.vehicle_type;
          if (wo.vehicle_model) existing.model = wo.vehicle_model;
          if (wo.vehicle_year) existing.year = wo.vehicle_year;
        } else {
          activeAppt.push({
            id: wo.id,
            wo_id: wo.id,
            uuid: wo.uuid,
            wo_uuid: wo.uuid,
            status: woStatus,
            progress: calcProgress,
            estimated_delivery: wo.delivery_date || null,
            preferred_date: wo.order_date,
            preferred_time: null,
            price: parseFloat(wo.total_amount || 0),
            total_amount: parseFloat(wo.total_amount || 0),
            paid_amount: parseFloat(wo.paid_amount || 0),
            remaining_amount: parseFloat(wo.remaining_amount || 0),
            payment_method: wo.payment_method || null,
            technician_name: wo.technician_name || null,
            service_progress: progressObj,
            started_at: wo.started_at || null,
            completed_at: wo.completed_at || null,
            vehicle_color: wo.vehicle_color || null,
            chassis_number: wo.chassis_number || null,
            mileage_km: wo.mileage_km || null,
            heat_insulation: parseJSON(wo.heat_insulation),
            polishing: parseJSON(wo.polishing),
            nano_ceramic: parseJSON(wo.nano_ceramic),
            ppf: parseJSON(wo.ppf),
            removal_services: parseJSON(wo.removal_services),
            inspection_notes: wo.inspection_notes || null,
            is_work_order: true,
            work_order_number: wo.work_order_number,
            currency: 'SAR',
            warranty_years: wo.warranty_years || 10,
            has_warranty: wo.has_warranty || 0,
            service_name: 'Work Order Check List (خدمة عناية وحماية)',
            tier_name: 'Check List Package',
            service_technicians: parseJSON(wo.service_technicians, {}),
            brand: wo.vehicle_type || 'Vehicle',
            model: wo.vehicle_model || '',
            year: wo.vehicle_year || ''
          });
        }
      }
  }

  // سجل الخدمات المكتملة وجميع أوامر العمل المسجلة للعميل
  const [historyRows] = await pool.query(
    `SELECT
       a.uuid, a.status, a.price, a.currency, a.points_earned,
       DATE_FORMAT(a.preferred_date, '%m/%d/%Y') AS date_display,
       a.preferred_date,
       s.name_en AS service,
       v.brand, v.model, v.year, v.color, v.plate, v.chassis_number,
       CONCAT(COALESCE(v.brand, ''), ' ', COALESCE(v.model, ''), IF(v.year IS NOT NULL AND v.year != '', CONCAT(' (', v.year, ')'), '')) AS vehicle
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     JOIN vehicles  v ON v.id = a.vehicle_id
     WHERE a.client_id = ?
     ORDER BY a.preferred_date DESC`,
    [userId]
  );

  let woAll = [];
  if (req.user?.phone || userId) {
    const rawUserPhone = req.user?.phone ? String(req.user.phone).replace(/\D/g, '') : '';
    const cleanPhone = rawUserPhone ? rawUserPhone.slice(-9) : '';
    const [woRows] = await pool.query(
      `SELECT id, uuid, work_order_number, client_name, client_phone, total_amount, price, paid_amount, remaining_amount,
              vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, chassis_number, mileage_km,
              status, delivery_date, order_date, payment_method, technician_name, service_progress,
              started_at, completed_at, heat_insulation, polishing, nano_ceramic, ppf, removal_services,
              inspection_notes, inspection_checklist, warranty_years, has_warranty, service_technicians, service_warranties,
              branch_name, product_name, product_model, coverage_area, service_details
       FROM work_orders
       WHERE client_phone LIKE ? OR client_phone LIKE ?
       ORDER BY id DESC`,
      [`%${cleanPhone}%`, `%${rawUserPhone}%`]
    );
    woAll = woRows;
  }

  const parseJSON = (data, defaultVal = []) => {
    if (!data) return defaultVal;
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); } catch { return defaultVal; }
  };

  const history = [
    ...woAll.map(w => ({
      id: w.id || w.uuid,
      uuid: w.uuid,
      work_order_id: w.id,
      work_order_number: w.work_order_number,
      service: 'Check List Order (طلب فحص وعناية)',
      vehicle: [w.vehicle_type, w.vehicle_model, w.vehicle_year].filter(v => v && String(v).trim()).join(' ') || 'سيارة العميل',
      brand: w.vehicle_type || null,
      model: w.vehicle_model || null,
      year: w.vehicle_year || null,
      vehicle_type: w.vehicle_type || null,
      vehicle_model: w.vehicle_model || null,
      vehicle_year: w.vehicle_year || null,
      date: w.order_date ? new Date(w.order_date).toLocaleDateString('en-US') : 'N/A',
      preferred_date: w.order_date,
      price: parseFloat(w.total_amount || w.price || 0),
      total_amount: parseFloat(w.total_amount || 0),
      paid_amount: parseFloat(w.paid_amount || 0),
      remaining_amount: parseFloat(w.remaining_amount || 0),
      payment_method: w.payment_method || 'مدى / نقداً',
      currency: 'SAR',
      status: w.status,
      technician_name: w.technician_name || null,
      started_at: w.started_at,
      completed_at: w.completed_at,
      vehicle_color: w.vehicle_color,
      vehicle_plate: w.vehicle_plate,
      plate_number: w.vehicle_plate,
      chassis_number: w.chassis_number,
      mileage_km: w.mileage_km,
      heat_insulation: parseJSON(w.heat_insulation),
      polishing: parseJSON(w.polishing),
      nano_ceramic: parseJSON(w.nano_ceramic),
      ppf: parseJSON(w.ppf),
      removal_services: parseJSON(w.removal_services),
      service_progress: parseJSON(w.service_progress, {}),
      inspection_notes: w.inspection_notes,
      inspection_checklist: parseJSON(w.inspection_checklist, {}),
      service_warranties: parseJSON(w.service_warranties, {}),
      service_technicians: parseJSON(w.service_technicians, {}),
      branch_name: w.branch_name || 'Reflecto Center',
      product_name: w.product_name,
      product_model: w.product_model,
      coverage_area: w.coverage_area,
      service_details: w.service_details,
      warranty_years: w.warranty_years || 10,
      has_warranty: w.has_warranty || 0,
      points_earned: 50,
      is_work_order: true
    })),
    ...historyRows.map(h => ({
      ...h,
      id: h.uuid,
      brand: h.brand || null,
      model: h.model || null,
      year: h.year || null,
      vehicle_type: h.brand || null,
      vehicle_model: h.model || null,
      vehicle_year: h.year || null,
      vehicle_color: h.color || null,
      vehicle_plate: h.plate || null,
      chassis_number: h.chassis_number || null,
      is_work_order: false
    }))
  ];

  // نقاط الولاء
  const [loyaltyRows] = await pool.query(
    'SELECT total_points FROM loyalty_points WHERE client_id = ?',
    [userId]
  );
  const totalPoints = loyaltyRows.length ? loyaltyRows[0].total_points : 0;
  const loyaltyMeta = calcLoyaltyMeta(totalPoints);

  // آخر معاملات النقاط
  const [loyaltyHistory] = await pool.query(
    `SELECT id, type, points, description, appointment_id, work_order_uuid,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS date,
       created_at
     FROM loyalty_transactions
     WHERE to_user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  // Warranties are only activated by admin action, not auto-synced here

  // الضمانات المعتمدة (Warranties for client and linked orders)
  const [warrantyRows] = await pool.query(
    `SELECT w.id, w.uuid, w.service_name, w.start_date, w.coverage_years, w.coverage_months, w.unit, w.expiry_date, w.certificate_url, w.is_active,
            w.work_order_id,
            COALESCE(w.product_name, wo.product_name) AS product_name,
            COALESCE(w.product_model, wo.product_model) AS product_model,
            COALESCE(w.coverage_area, wo.coverage_area) AS coverage_area,
            COALESCE(w.service_details, wo.service_details) AS service_details,
            COALESCE(wo.branch_name, 'Reflecto Center') AS branch_name,
            COALESCE(NULLIF(w.vehicle_name, ''), TRIM(CONCAT(COALESCE(v.brand, wo.vehicle_type, ''), ' ', COALESCE(v.model, wo.vehicle_model, ''))), 'سيارة العميل') AS vehicle_name,
            u.full_name AS client_name, u.phone AS client_phone, u.email AS client_email,
            COALESCE(v.brand, wo.vehicle_type) AS brand,
            COALESCE(v.model, wo.vehicle_model) AS model,
            COALESCE(v.year, wo.vehicle_year) AS year,
            COALESCE(v.color, wo.vehicle_color) AS color,
            COALESCE(v.plate, wo.vehicle_plate) AS vehicle_plate,
            COALESCE(v.plate, wo.vehicle_plate) AS plate_number,
            COALESCE(v.chassis_number, wo.chassis_number) AS chassis_number,
            wo.work_order_number
     FROM warranties w
     LEFT JOIN vehicles v ON w.vehicle_id = v.id
     LEFT JOIN users u ON w.client_id = u.id
     LEFT JOIN appointments a ON w.appointment_id = a.id
     LEFT JOIN work_orders wo ON w.work_order_id = wo.id
     WHERE (w.client_id = ? OR (wo.client_phone IS NOT NULL AND (wo.client_phone LIKE ? OR wo.client_phone LIKE ?)))
     ORDER BY w.created_at DESC`,
    [userId, `%${cleanPhone}%`, `%${rawUserPhone}%`]
  );

  // الإحصائيات (المشتريات والمدفوعات المكتملة فقط)
  const [stats] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM appointments WHERE client_id = ? AND status IN ('completed', 'confirmed', 'in_progress')) AS total_services,
       COALESCE(
         (SELECT SUM(amount) FROM payments WHERE user_id = ? AND status = 'completed'),
         (SELECT SUM(price) FROM appointments WHERE client_id = ? AND status IN ('completed', 'confirmed')),
         0
       ) AS total_spent,
       'SAR' AS currency`,
    [userId, userId, userId]
  );

  // الـ Checklist (أي خدمات اشتراها العميل)
  const [checklist] = await pool.query(
    `SELECT s.slug
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE a.client_id = ? AND a.status IN ('completed','in_progress')`,
    [userId]
  );
  const doneServices = new Set(checklist.map((r) => r.slug));

  // سيارات العميل (Client vehicles)
  const [vehicleRows] = await pool.query(
    `SELECT uuid AS id, brand, model, year, color, plate AS plate_number, chassis_number
     FROM vehicles
     WHERE client_id = ?
     ORDER BY id DESC`,
    [userId]
  );

  // الباقات المخصصة للعميل والشركة (Special & Corporate Company packages)
  let companyCustomPrices = {};
  let companyDiscountPercent = 0;
  const userCompanyId = req.user.company_id;

  if (userCompanyId) {
    const [[compRow]] = await pool.query('SELECT discount_percent FROM companies WHERE id = ?', [userCompanyId]);
    if (compRow) companyDiscountPercent = parseFloat(compRow.discount_percent || 0);

    const [cpRows] = await pool.query('SELECT pricing_tier_id, custom_price FROM company_package_prices WHERE company_id = ?', [userCompanyId]);
    cpRows.forEach(c => {
      companyCustomPrices[c.pricing_tier_id] = parseFloat(c.custom_price);
    });
  }

  const [specialPackages] = await pool.query(
    `SELECT pt.id AS int_id, pt.uuid AS id, pt.slug, pt.name_en, pt.name_ar, pt.tagline_en, pt.tagline_ar,
       pt.price, pt.currency, pt.warranty_years, pt.features_en, pt.features_ar,
       s.name_en AS service_name, s.uuid AS service_uuid
     FROM pricing_tiers pt
     LEFT JOIN services s ON pt.service_id = s.id
     WHERE pt.client_id = ? 
        OR (? IS NOT NULL AND (pt.id IN (SELECT pricing_tier_id FROM company_package_prices WHERE company_id = ?) OR ? > 0))
     ORDER BY pt.sort_order ASC, pt.id DESC`,
    [userId, userCompanyId, userCompanyId, companyDiscountPercent]
  );

  const activeAppointments = activeAppt.map(appt => ({
    id:       appt.uuid,
    uuid:     appt.uuid,
    work_order_id: appt.wo_uuid || appt.uuid,
    wo_uuid:  appt.wo_uuid || null,
    work_order_number: appt.work_order_number || null,
    service:  appt.service_name,
    tier:     appt.tier_name,
    vehicle:  `${appt.brand || ''} ${appt.model || ''} ${appt.year || ''}`.trim() || 'سيارة العميل',
    brand:    appt.brand || '',
    model:    appt.model || '',
    year:     appt.year || '',
    vehicle_color: appt.vehicle_color || '',
    vehicle_plate: appt.vehicle_plate || '',
    chassis_number: appt.chassis_number || '',
    status:   appt.status,
    progress: (appt.progress !== undefined && appt.progress !== null) ? appt.progress : calcProgress(appt.preferred_date, appt.estimated_delivery, appt.status, appt.progress),
    estimated_delivery: appt.estimated_delivery || null,
    time_remaining: calcTimeRemaining(appt.estimated_delivery),
    total_amount: parseFloat(appt.total_amount || appt.price || 0),
    paid_amount:  parseFloat(appt.paid_amount || (appt.is_work_order ? 0 : (appt.price || 0))),
    remaining_amount: appt.is_work_order ? parseFloat(appt.remaining_amount || 0) : 0,
    payment_method: appt.payment_method || null,
    technician_name: appt.technician_name || null,
    started_at: appt.started_at || null,
    completed_at: appt.completed_at || null,
    service_progress: appt.service_progress || {},
    heat_insulation: appt.heat_insulation || [],
    polishing: appt.polishing || [],
    nano_ceramic: appt.nano_ceramic || [],
    ppf: appt.ppf || [],
    removal_services: appt.removal_services || [],
    inspection_notes: appt.inspection_notes || null,
    is_work_order: Boolean(appt.is_work_order),
    warranty_years: parseInt(appt.warranty_years || 0),
    has_warranty: Boolean(appt.has_warranty),
    warranty_end_date: appt.warranty_end_date || null,
    preferred_date: appt.preferred_date ? new Date(appt.preferred_date).toISOString().split('T')[0] : null,
    preferred_time: appt.preferred_time || null,
    delivery_date_display: appt.estimated_delivery
      ? new Date(appt.estimated_delivery).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : (appt.preferred_date ? new Date(appt.preferred_date).toLocaleDateString('ar-SA') : null),
    service_checklist: {
      paint_protection:  doneServices.has('ppf'),
      nano_ceramic:      doneServices.has('nano-ceramic'),
      paint_correction:  doneServices.has('paint-correction'),
      thermal_insulation: doneServices.has('thermal-insulation'),
      dash_cam:          doneServices.has('dash-cam'),
    },
  }));

  const currentAppt = activeAppointments.length ? activeAppointments[0] : null;

  res.json({
    id:          req.user.uuid,
    full_name:   req.user.full_name,
    phone:       req.user.phone,
    email:       req.user.email,
    role:        req.user.role,
    role_id:     req.user.role_id || null,
    is_super_admin: !!req.user.is_super_admin,
    permissions: req.user.permissions,
    company_id:  req.user.company_id || null,
    is_corporate: !!req.user.is_corporate,
    company: company ? {
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      custom_message: company.custom_message,
      discount_percent: parseFloat(company.discount_percent || 0),
    } : null,
    member_since: req.user.member_since,
    avatar_url:  req.user.avatar_url ? (req.user.avatar_url.startsWith('/') ? req.user.avatar_url : `/assets/company/${req.user.avatar_url}`) : null,
    city:        req.user.city || null,
    address:     req.user.address || null,
    notes:       req.user.notes || null,
    is_premium:  !!req.user.is_premium,
    branch_name: req.user.branch_name || 'فرع جدة',
    car_brand:   vehicleRows[0]?.brand || '',
    car_model:   vehicleRows[0]?.model || '',

    vehicles: vehicleRows,
    current_appointment: currentAppt,
    active_appointments: activeAppointments,

    loyalty: {
      total_points: totalPoints,
      ...loyaltyMeta,
      redemption_options: [
        { points: 1000, discount: 50,  currency: 'SAR', label: 'SAR 50 off' },
        { points: 2500, discount: 150, currency: 'SAR', label: 'SAR 150 off' },
        { points: 5000, discount: 350, currency: 'SAR', label: 'SAR 350 off' },
      ],
      history: loyaltyHistory,
    },

    special_packages: specialPackages.map((r) => {
      const basePrice = parseFloat(r.price || 0);
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
        id:            r.id,
        int_id:        r.int_id,
        slug:          r.slug,
        name_en:       r.name_en,
        name_ar:       r.name_ar,
        tagline_en:    r.tagline_en,
        tagline_ar:    r.tagline_ar,
        price:         finalPrice,
        original_price: basePrice,
        is_company_price: isCompanyPrice,
        currency:      r.currency || 'SAR',
        warranty_years: parseInt(r.warranty_years || 0),
        features_en:   typeof r.features_en === 'string' ? JSON.parse(r.features_en || '[]') : (r.features_en || []),
        features_ar:   typeof r.features_ar === 'string' ? JSON.parse(r.features_ar || '[]') : (r.features_ar || []),
        service_id:    r.service_uuid || null,
        service_name:  r.service_name || null,
      };
    }),

    warranty: warrantyRows.length ? warrantyRows[0] : null,
    warranties: warrantyRows,
    warranty_count: warrantyRows.length,

    service_history: history.map((h) => ({
      id:            h.uuid || h.id,
      uuid:          h.uuid || h.id,
      work_order_number: h.work_order_number || null,
      service:       h.service,
      vehicle:       h.vehicle,
      date:          h.date_display || h.date,
      preferred_date: h.preferred_date || null,
      price:         parseFloat(h.price || 0),
      total_amount:  parseFloat(h.total_amount || h.price || 0),
      paid_amount:   parseFloat(h.paid_amount || 0),
      remaining_amount: parseFloat(h.remaining_amount || 0),
      payment_method: h.payment_method || null,
      currency:      h.currency || 'SAR',
      points_earned: h.points_earned || 100,
      status:        h.status,
      technician_name: h.technician_name || null,
      started_at:    h.started_at || null,
      completed_at:  h.completed_at || null,
      // Vehicle details
      vehicle_type:  h.brand || null,
      vehicle_model: h.model || null,
      vehicle_year:  h.year || null,
      vehicle_color: h.vehicle_color || null,
      vehicle_plate: h.vehicle_plate || null,
      chassis_number: h.chassis_number || null,
      mileage_km:    h.mileage_km || null,
      // Service checklist (work order)
      heat_insulation:  h.heat_insulation || [],
      polishing:        h.polishing || [],
      nano_ceramic:     h.nano_ceramic || [],
      ppf:              h.ppf || [],
      removal_services: h.removal_services || [],
      service_progress: h.service_progress || {},
      inspection_notes: h.inspection_notes || null,
      inspection_checklist: h.inspection_checklist || {},
      service_warranties:   h.service_warranties || {},
      work_order_id:        h.work_order_id || h.id || null,
      branch_name:          h.branch_name || 'Reflecto Center',
      product_name:         h.product_name || null,
      product_model:        h.product_model || null,
      coverage_area:        h.coverage_area || null,
      service_details:      h.service_details || null,
      // Warranty
      warranty_years:  h.warranty_years || 0,
      has_warranty:    h.has_warranty || false,
      is_work_order:   h.is_work_order || false,
    })),

    stats: {
      total_services:      parseInt(stats[0]?.total_services || 0),
      total_warranty_years: warrantyRows.reduce((sum, w) => sum + w.coverage_years, 0),
      total_points:        totalPoints,
      total_spent:         parseFloat(stats[0]?.total_spent || 0),
      currency:            stats[0]?.currency || 'SAR',
    },
  });
}
async function getMyPayments(req, res) {
   const userId = req.user.id;

   try {
     const [rows] = await pool.query(
       `SELECT p.uuid AS id, p.amount, p.currency, p.payment_method,
               p.session_id, p.status, p.created_at
        FROM payments p
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC`,
       [userId]
     );

     res.json({
       success: true,
       data: rows.map(r => ({
         id: r.id,
         amount: parseFloat(r.amount),
         currency: r.currency,
         payment_method: r.payment_method,
         status: r.status,
         created_at: r.created_at,
       }))
     });
   } catch (error) {
     console.error('Get My Payments Error:', error);
     res.status(500).json({
       success: false,
       error: { code: 'DB_ERROR', message: 'Failed to fetch payments' }
     });
   }
}

// ─── Vehicle Management ────────────────────────────────────────────────

async function getMyVehicles(req, res) {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT uuid AS id, brand, model, year, color, plate AS plate_number
       FROM vehicles
       WHERE client_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Failed to fetch vehicles' }
    });
  }
}

async function addMyVehicle(req, res) {
  const userId = req.user.id;
  const { brand, model, year, color, plate_number } = req.body;

  if (!brand || !model || !year) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'brand, model, and year are required' }
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO vehicles (client_id, brand, model, year, color, plate, uuid)
       VALUES (?, ?, ?, ?, ?, ?, UUID())`,
      [userId, brand, model, year, color || null, plate_number || null]
    );

    const vehicleId = result.insertId;
    const [[newVehicle]] = await pool.query(
      'SELECT uuid AS id, brand, model, year, color, plate AS plate_number FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    res.status(201).json({
      success: true,
      data: newVehicle
    });
  } catch (error) {
    console.error('Add Vehicle Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Failed to add vehicle' }
    });
  }
}

async function changePassword(req, res) {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Current password and new password are required' }
    });
  }

  if (new_password.length < 5) {
    return res.status(400).json({
      success: false,
      error: { code: 'WEAK_PASSWORD', message: 'New password must be at least 5 characters long' }
    });
  }

  const bcrypt = require('bcryptjs');
  const [[user]] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

  if (!user || !user.password) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_PASSWORD', message: 'Password is not set for this account' }
    });
  }

  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' }
    });
  }

  const hashed = await bcrypt.hash(new_password, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

  res.json({ success: true, message: 'Password changed successfully' });
}

module.exports = { getMe, getMyPayments, getMyVehicles, addMyVehicle, changePassword };
