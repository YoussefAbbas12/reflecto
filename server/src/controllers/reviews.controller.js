const { pool } = require('../config/database');

/**
 * Submit a review for a completed service / order
 * Awards 10 loyalty points automatically.
 */
async function submitReview(req, res) {
    try {
        const userId = req.user.id;
        const {
            order_id,
            appointment_id,
            rating,
            rating_quality,
            rating_staff,
            rating_timing,
            rating_system,
            comment,
            branch_name: reqBranch
        } = req.body;

        let resolvedOrderId = null;
        let resolvedApptId = null;

        if (order_id) {
            if (typeof order_id === 'number' || /^\d+$/.test(String(order_id))) {
                resolvedOrderId = parseInt(order_id, 10);
            } else {
                const [[wo]] = await pool.query('SELECT id FROM work_orders WHERE uuid = ? OR work_order_number = ? LIMIT 1', [order_id, order_id]);
                if (wo) resolvedOrderId = wo.id;
            }
        }

        if (appointment_id) {
            if (typeof appointment_id === 'number' || /^\d+$/.test(String(appointment_id))) {
                resolvedApptId = parseInt(appointment_id, 10);
            } else {
                const [[appt]] = await pool.query('SELECT id FROM appointments WHERE uuid = ? LIMIT 1', [appointment_id, appointment_id]);
                if (appt) resolvedApptId = appt.id;
            }
        }

        const q = parseInt(rating_quality || rating || 5, 10);
        const s = parseInt(rating_staff || rating || 5, 10);
        const t = parseInt(rating_timing || rating || 5, 10);
        const sys = parseInt(rating_system || rating || 5, 10);

        const overallRating = Math.round((q + s + t + sys) / 4);

        if (overallRating < 1 || overallRating > 5) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_RATING', message: 'يرجى تحديد التقييم من 1 إلى 5 نجوم' },
            });
        }

        const finalBranch = reqBranch || req.user.branch_name || 'فرع جدة';
        const pointsAwarded = 10;

        // Check if user already submitted a review for this user/order/appointment
        const [[existing]] = await pool.query(
            `SELECT id FROM service_reviews 
       WHERE user_id = ? 
         AND ((order_id IS NOT NULL AND order_id = ?) 
           OR (appointment_id IS NOT NULL AND appointment_id = ?))`,
            [userId, resolvedOrderId || null, resolvedApptId || null]
        );
        if (existing) {
            return res.status(400).json({
                success: false,
                error: { code: 'ALREADY_REVIEWED', message: 'لقد قمت بإرسال تقييمك لهذه الخدمة سابقاً. شكراً لك!' },
            });
        }

        // Insert the review
        const [result] = await pool.query(
            `INSERT INTO service_reviews (uuid, user_id, order_id, appointment_id, branch_name, rating, rating_quality, rating_staff, rating_timing, rating_system, comment, points_awarded)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, resolvedOrderId || null, resolvedApptId || null, finalBranch, overallRating, q, s, t, sys, comment || null, pointsAwarded]
        );

        // Award loyalty points
        await pool.query(
            `INSERT INTO loyalty_points (client_id, total_points) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total_points = total_points + ?`,
            [userId, pointsAwarded, pointsAwarded]
        );

        // Try to log transaction - don't fail if it errors
        await pool.query(
            `INSERT INTO loyalty_transactions (from_user_id, to_user_id, type, points, description)
       VALUES (NULL, ?, 'earned', ?, ?)`,
            [userId, pointsAwarded, `مكافأة تقييم الخدمة (+${pointsAwarded} نقاط ولاء)`]
        ).catch(() => { });

        // Get updated points
        const [[lp]] = await pool.query(
            'SELECT total_points FROM loyalty_points WHERE client_id = ?',
            [userId]
        );

        return res.json({
            success: true,
            message: `شكراً لتقييمك! تم إضافة ${pointsAwarded} نقاط ولاء إلى رصيدك.`,
            review_id: result.insertId,
            points_awarded: pointsAwarded,
            new_total_points: lp?.total_points || pointsAwarded,
        });

    } catch (err) {
        console.error('Submit review error:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'حدث خطأ أثناء حفظ التقييم، يرجى المحاولة مرة أخرى.' },
        });
    }
}

/**
 * Get current user's submitted reviews
 */
async function getMyReviews(req, res) {
    try {
        const userId = req.user.id;
        const [reviews] = await pool.query(
            `SELECT 
               sr.id, sr.order_id, sr.appointment_id, sr.branch_name, sr.rating, 
               sr.rating_quality, sr.rating_staff, sr.rating_timing, sr.rating_system, 
               sr.comment, sr.points_awarded, sr.created_at,
               a.uuid AS appt_uuid,
               wo.uuid AS wo_uuid,
               wo.work_order_number
             FROM service_reviews sr
             LEFT JOIN appointments a ON a.id = sr.appointment_id
             LEFT JOIN work_orders wo ON wo.id = sr.order_id
             WHERE sr.user_id = ?
             ORDER BY sr.created_at DESC`,
            [userId]
        );

        return res.json({ success: true, reviews });
    } catch (err) {
        console.error('Get my reviews error:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'حدث خطأ أثناء تحميل التقييمات' },
        });
    }
}

/**
 * Admin view of all reviews, branch statistics, and satisfaction metrics over time
 */
async function getAdminReviews(req, res) {
    try {
        const { branch, period } = req.query;

        const whereClauses = [];
        const params = [];

        if (branch && branch !== 'all') {
            whereClauses.push('sr.branch_name = ?');
            params.push(branch);
        }

        if (period === 'month') {
            whereClauses.push('sr.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
        } else if (period === 'year') {
            whereClauses.push('sr.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)');
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Reviews list with user details
        const [reviews] = await pool.query(
            `SELECT 
         sr.id, sr.uuid, sr.rating, sr.rating_quality, sr.rating_staff, sr.rating_timing, sr.rating_system,
         sr.comment, sr.branch_name, sr.points_awarded, sr.created_at,
         sr.user_id as client_id,
         u.full_name as client_name, u.phone as client_phone
       FROM service_reviews sr
       LEFT JOIN users u ON sr.user_id = u.id
       ${whereSql}
       ORDER BY sr.created_at DESC
       LIMIT 200`,
            params
        );

        // Summary stats
        const [[stats]] = await pool.query(
            `SELECT 
         COUNT(*) as total_reviews,
         COALESCE(AVG(sr.rating), 0) as avg_rating,
         COALESCE(AVG(sr.rating_quality), 0) as avg_quality,
         COALESCE(AVG(sr.rating_staff), 0) as avg_staff,
         COALESCE(AVG(sr.rating_timing), 0) as avg_timing,
         COALESCE(AVG(sr.rating_system), 0) as avg_system,
         COALESCE(SUM(CASE WHEN sr.rating >= 4 THEN 1 ELSE 0 END), 0) as positive_reviews,
         COALESCE(SUM(sr.points_awarded), 0) as total_points_awarded
       FROM service_reviews sr
       ${whereSql}`,
            params
        );

        const totalReviews = Number(stats?.total_reviews || 0);
        const avgRating = Number(stats?.avg_rating || 0).toFixed(1);
        const satisfactionRate = totalReviews > 0
            ? Math.round((Number(stats?.positive_reviews || 0) / totalReviews) * 100)
            : 100;

        // Branch stats (for period filter, no user WHERE params needed)
        const periodWhere = period === 'month'
            ? 'WHERE sr.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'
            : period === 'year'
                ? 'WHERE sr.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)'
                : '';

        const [branchStats] = await pool.query(
            `SELECT 
         COALESCE(sr.branch_name, 'غير محدد') as branch_name,
         COUNT(*) as review_count,
         ROUND(AVG(sr.rating), 2) as avg_rating,
         ROUND((SUM(CASE WHEN sr.rating >= 4 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as satisfaction_rate
       FROM service_reviews sr
       ${periodWhere}
       GROUP BY sr.branch_name
       ORDER BY avg_rating DESC, review_count DESC`
        );

        // Time trends
        const [timeTrends] = await pool.query(
            `SELECT 
         DATE_FORMAT(sr.created_at, '%Y-%m') as period_key,
         DATE_FORMAT(sr.created_at, '%b %Y') as period_label,
         COUNT(*) as count,
         ROUND(AVG(sr.rating), 2) as avg_rating,
         ROUND((SUM(CASE WHEN sr.rating >= 4 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as satisfaction_rate
       FROM service_reviews sr
       ${whereSql}
       GROUP BY DATE_FORMAT(sr.created_at, '%Y-%m'), DATE_FORMAT(sr.created_at, '%b %Y')
       ORDER BY period_key ASC`,
            params
        );

        // Available branches
        const [branchesList] = await pool.query(
            `SELECT DISTINCT branch_name FROM service_reviews WHERE branch_name IS NOT NULL AND branch_name != '' ORDER BY branch_name`
        );

        return res.json({
            success: true,
            reviews,
            stats: {
                total_reviews: totalReviews,
                avg_rating: parseFloat(avgRating),
                avg_quality: Number(stats?.avg_quality || 0).toFixed(1),
                avg_staff: Number(stats?.avg_staff || 0).toFixed(1),
                avg_timing: Number(stats?.avg_timing || 0).toFixed(1),
                avg_system: Number(stats?.avg_system || 0).toFixed(1),
                satisfaction_rate: satisfactionRate,
                total_points_awarded: Number(stats?.total_points_awarded || 0),
            },
            branchStats,
            timeTrends,
            branches: branchesList.map(b => b.branch_name),
        });

    } catch (err) {
        console.error('Get admin reviews error:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'حدث خطأ أثناء الحصول على بيانات المراجعات' },
        });
    }
}

module.exports = { submitReview, getMyReviews, getAdminReviews };
