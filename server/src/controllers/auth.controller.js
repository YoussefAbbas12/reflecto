const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { setOTP, getOTP, incrementAttempts, deleteOTP, checkRateLimit } = require('../config/otpStore');

function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function generateTokens(userId, role) {
    const accessToken = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    return { accessToken, refreshToken };
}

const { sendSMS } = require('../services/sms.service');

async function sendOTP(req, res) {
    let { phone } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_PHONE', message: 'Please provide a valid phone number' },
        });
    }

    const isRateLimited = checkRateLimit(phone);
    if (isRateLimited) {
        return res.status(429).json({
            success: false,
            error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again later.' },
        });
    }

    const otpCode = generateOTP();
    setOTP(phone, otpCode);

    await sendSMS(phone, `رمز التحقق الخاص بك لخدمات ريفليكتو هو: ${otpCode}`);

    // In development, you might want to return the OTP in the response for testing
    // Remove this in production!
    const isDev = process.env.ALLOW_DEBUG_OTP === 'true';

    res.json({
        success: true,
        message: 'OTP sent successfully',
        ...(isDev && { dev_code: otpCode })
    });
}

async function verifyOTP(req, res) {
    let { phone, code, create_if_missing } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !code) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'Phone and code are required' },
        });
    }

    const entry = getOTP(phone);
    if (!entry) {
        return res.status(401).json({
            success: false,
            error: { code: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new one.' },
        });
    }

    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
    if (entry.attempts >= maxAttempts) {
        deleteOTP(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many wrong attempts. Please request a new OTP.' },
        });
    }

    if (entry.otp !== code) {
        incrementAttempts(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_OTP', message: 'Invalid OTP code' },
        });
    }

    deleteOTP(phone);

    let [rows] = await pool.query(
        `SELECT 
       u.uuid, u.phone, u.full_name, u.email, u.role, u.role_id, u.is_super_admin, u.branch_name, 
       u.permissions AS user_permissions, u.member_since,
       r.name AS role_name, r.slug AS role_slug, r.permissions AS role_permissions
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.phone = ? AND u.is_active = 1`,
        [phone]
    );

    if (!rows.length) {
        if (create_if_missing === false) {
            return res.json({
                success: true,
                message: 'OTP verified successfully',
                user_exists: false
            });
        }

        await pool.query(
            'INSERT IGNORE INTO users (phone, uuid) VALUES (?, UUID())',
            [phone]
        );
        await pool.query(
            `INSERT IGNORE INTO loyalty_points (client_id, total_points)
         SELECT id, 0 FROM users WHERE phone = ?`,
            [phone]
        );

        const [newRows] = await pool.query(
            `SELECT 
           u.uuid, u.phone, u.full_name, u.email, u.role, u.role_id, u.is_super_admin, u.branch_name, 
           u.permissions AS user_permissions, u.member_since,
           r.name AS role_name, r.slug AS role_slug, r.permissions AS role_permissions
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
         WHERE u.phone = ? AND u.is_active = 1`,
            [phone]
        );
        rows = newRows;
    }

    if (!rows.length) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' },
        });
    }

    const user = rows[0];
    let parsedRolePerms = {};
    if (user.role_permissions) {
        try { parsedRolePerms = typeof user.role_permissions === 'string' ? JSON.parse(user.role_permissions) : user.role_permissions; } catch (e) { }
    }
    let parsedUserPerms = {};
    if (user.user_permissions) {
        try { parsedUserPerms = typeof user.user_permissions === 'string' ? JSON.parse(user.user_permissions) : user.user_permissions; } catch (e) { }
    }
    let resolvedRole = user.role;
    if (user.role_id && (!resolvedRole || resolvedRole === 'client')) {
        resolvedRole = user.role_slug || 'admin';
    }

    const isStaff = resolvedRole === 'admin' || resolvedRole === 'super_admin' || Boolean(user.is_super_admin) || Boolean(user.role_id);
    const isTech = resolvedRole === 'technician';
    const { portal_type } = req.body; // 'admin' | 'technician' | 'client'

    if (portal_type === 'admin') {
        if (!isStaff) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN_PORTAL', message: 'غير مصرح لك بالدخول إلى بوابة الإدارة.' }
            });
        }
    } else if (portal_type === 'technician') {
        if (!isTech) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN_PORTAL', message: 'هذه البوابة مخصصة للفنيين المعتمدين فقط.' }
            });
        }
    } else {
        // Default Client Portal
        if (isStaff) {
            return res.status(403).json({
                success: false,
                error: { code: 'USE_DEDICATED_PORTAL', message: 'حسابك إداري. يرجى تسجيل الدخول من بوابة الإدارة: admin.reflecto.com.sa' }
            });
        }
        if (isTech) {
            return res.status(403).json({
                success: false,
                error: { code: 'USE_DEDICATED_PORTAL', message: 'حسابك فني. يرجى تسجيل الدخول من بوابة الفنيين: technical.reflecto.com.sa' }
            });
        }
    }

    const { accessToken, refreshToken } = generateTokens(user.uuid, resolvedRole);

    res.json({
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
            id: user.uuid,
            phone: user.phone,
            full_name: user.full_name,
            email: user.email,
            role: resolvedRole,
            role_id: user.role_id || null,
            role_name: user.role_name || null,
            is_super_admin: !!user.is_super_admin,
            branch_name: user.branch_name,
            permissions: { ...parsedRolePerms, ...parsedUserPerms },
            member_since: user.member_since,
        },
    });
}

async function refreshToken(req, res) {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' },
        });
    }

    try {
        const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
        const [rows] = await pool.query(
            'SELECT uuid, role FROM users WHERE uuid = ? AND is_active = 1',
            [decoded.userId]
        );

        if (!rows.length) {
            return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
        }

        const user = rows[0];
        const tokens = generateTokens(user.uuid, user.role);
        res.json({
            success: true,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
        });
    } catch {
        res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
    }
}

async function logout(req, res) {
    // في الـ production: أضف الـ token لـ Redis blacklist
    res.json({ success: true, message: 'Logged out successfully' });
}

async function login(req, res) {
    let { phone, email, identifier, password } = req.body;
    let inputVal = (identifier || phone || email || '').trim();
    if (inputVal && !inputVal.includes('@')) {
        inputVal = inputVal.replace(/\s/g, '');
    }

    if (!inputVal || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور' },
        });
    }

    try {
        const isEmail = inputVal.includes('@');
        let rows;

        if (isEmail) {
            [rows] = await pool.query(
                `SELECT 
          u.uuid, u.phone, u.password, u.full_name, u.email, u.role, u.role_id, 
          u.is_super_admin, u.branch_name, u.permissions AS user_permissions, u.member_since,
          r.name AS role_name, r.slug AS role_slug, r.permissions AS role_permissions
        FROM users u
        LEFT JOIN roles r ON (r.id = u.role_id OR r.slug = u.role OR r.uuid = u.role)
        WHERE LOWER(u.email) = LOWER(?) AND u.is_active = 1`,
                [inputVal]
            );
        } else {
            const rawDigits = inputVal.replace(/\D/g, '');
            const last9 = rawDigits.length >= 9 ? rawDigits.slice(-9) : rawDigits;

            [rows] = await pool.query(
                `SELECT 
          u.uuid, u.phone, u.password, u.full_name, u.email, u.role, u.role_id, 
          u.is_super_admin, u.branch_name, u.permissions AS user_permissions, u.member_since,
          r.name AS role_name, r.slug AS role_slug, r.permissions AS role_permissions
        FROM users u
        LEFT JOIN roles r ON (r.id = u.role_id OR r.slug = u.role OR r.uuid = u.role)
        WHERE (u.phone LIKE ? OR u.phone = ? OR LOWER(u.email) = LOWER(?)) AND u.is_active = 1`,
                [`%${last9}`, inputVal, inputVal]
            );
        }
        if (!rows.length) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone number or password' },
            });
        }

        const user = rows[0];

        if (!user.password) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'PASSWORD_NOT_SET',
                    message: 'Password not set for this account. Please sign up to verify your number and set a password.'
                },
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone number or password' },
            });
        }

        let parsedRolePerms = {};
        if (user.role_permissions) {
            try { parsedRolePerms = typeof user.role_permissions === 'string' ? JSON.parse(user.role_permissions) : user.role_permissions; } catch (e) { }
        }
        let parsedUserPerms = {};
        if (user.user_permissions) {
            try { parsedUserPerms = typeof user.user_permissions === 'string' ? JSON.parse(user.user_permissions) : user.user_permissions; } catch (e) { }
        }
        const mergedPerms = {};
        const allKeys = new Set([...Object.keys(parsedRolePerms), ...Object.keys(parsedUserPerms)]);
        allKeys.forEach(k => {
            mergedPerms[k] = Boolean(parsedRolePerms[k] || parsedUserPerms[k]);
        });

        let resolvedRole = user.role;
        if (user.role_id && (!resolvedRole || resolvedRole === 'client')) {
            resolvedRole = user.role_slug || 'admin';
        }

        const isStaff = resolvedRole === 'admin' || resolvedRole === 'super_admin' || Boolean(user.is_super_admin) || Boolean(user.role_id);
        const isTech = resolvedRole === 'technician';
        const { portal_type } = req.body; // 'admin' | 'technician' | 'client'

        if (portal_type === 'admin') {
            if (!isStaff) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN_PORTAL', message: 'غير مصرح لك بالدخول إلى بوابة الإدارة.' }
                });
            }
        } else if (portal_type === 'technician') {
            if (!isTech) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN_PORTAL', message: 'هذه البوابة مخصصة للفنيين المعتمدين فقط.' }
                });
            }
        } else {
            // Default Client Portal
            if (isStaff) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'USE_DEDICATED_PORTAL', message: 'حسابك إداري. يرجى تسجيل الدخول من بوابة الإدارة: admin.reflecto.com.sa' }
                });
            }
            if (isTech) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'USE_DEDICATED_PORTAL', message: 'حسابك فني. يرجى تسجيل الدخول من بوابة الفنيين: technical.reflecto.com.sa' }
                });
            }
        }

        const { accessToken, refreshToken } = generateTokens(user.uuid, resolvedRole);

        res.json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.uuid,
                phone: user.phone,
                full_name: user.full_name,
                email: user.email,
                role: resolvedRole,
                role_id: user.role_id || null,
                role_name: user.role_name || null,
                is_super_admin: !!user.is_super_admin,
                branch_name: user.branch_name,
                permissions: mergedPerms,
                member_since: user.member_since,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
}

async function sendSignupOTP(req, res) {
    let { phone, email } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_PHONE', message: 'Please provide a valid phone number' },
        });
    }

    const isRateLimited = checkRateLimit(phone);
    if (isRateLimited) {
        return res.status(429).json({
            success: false,
            error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again later.' },
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT password FROM users WHERE phone = ?',
            [phone]
        );

        if (rows.length > 0 && rows[0].password) {
            return res.status(400).json({
                success: false,
                error: { code: 'USER_ALREADY_REGISTERED', message: 'This phone number is already registered. Please log in.' },
            });
        }

        if (email && email.trim()) {
            const cleanEmail = email.trim().toLowerCase();
            const [emailRows] = await pool.query(
                'SELECT id, password FROM users WHERE LOWER(email) = ? AND phone != ?',
                [cleanEmail, phone]
            );
            if (emailRows.length > 0 && emailRows[0].password) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'EMAIL_ALREADY_REGISTERED', message: 'This email address is already registered with another account. Please use a different email.' },
                });
            }
        }

        const otpCode = generateOTP();
        setOTP(phone, otpCode);

        await sendSMS(phone, `رمز التحقق لإنشاء حسابك في ريفليكتو هو: ${otpCode}`);

        const isDev = process.env.ALLOW_DEBUG_OTP === 'true';

        res.json({
            success: true,
            message: 'OTP sent successfully',
            ...(isDev && { dev_code: otpCode })
        });
    } catch (err) {
        console.error('Send Signup OTP Error:', err);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
}

async function verifySignupOTP(req, res) {
    let { phone, code } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !code) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'Phone and code are required' },
        });
    }

    const entry = getOTP(phone);
    if (!entry) {
        return res.status(401).json({
            success: false,
            error: { code: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new one.' },
        });
    }

    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
    if (entry.attempts >= maxAttempts) {
        deleteOTP(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many wrong attempts. Please request a new OTP.' },
        });
    }

    if (entry.otp !== code) {
        incrementAttempts(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_OTP', message: 'Invalid OTP code' },
        });
    }

    deleteOTP(phone);

    const signupToken = jwt.sign(
        { phone, type: 'signup' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '15m' }
    );

    res.json({
        success: true,
        message: 'OTP verified successfully',
        signup_token: signupToken,
    });
}

async function completeSignup(req, res) {
    const { signup_token, password, full_name, email } = req.body;

    if (!signup_token || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'Signup token and password are required' },
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: { code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters long' },
        });
    }

    try {
        let decoded;
        try {
            decoded = jwt.verify(signup_token, process.env.JWT_SECRET || 'default_secret');
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_SIGNUP_TOKEN', message: 'Signup session has expired or is invalid' },
            });
        }

        if (decoded.type !== 'signup' || !decoded.phone) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_SIGNUP_TOKEN', message: 'Invalid signup token type' },
            });
        }

        const phone = decoded.phone;
        const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

        if (cleanEmail) {
            const [emailCheck] = await pool.query(
                'SELECT id FROM users WHERE LOWER(email) = ? AND phone != ?',
                [cleanEmail, phone]
            );
            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'DUPLICATE_EMAIL', message: 'This email address is already registered with another account. Please use a different email.' },
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [existing] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);

        if (existing.length > 0) {
            // Update password + save name/email if provided
            await pool.query(
                `UPDATE users SET
           password = ?,
           is_active = 1,
           full_name = IF(? IS NOT NULL AND ? != '', ?, full_name),
           email     = IF(? IS NOT NULL AND ? != '', ?, email)
         WHERE phone = ?`,
                [hashedPassword, full_name, full_name, full_name, cleanEmail, cleanEmail, cleanEmail, phone]
            );
        } else {
            await pool.query(
                'INSERT INTO users (phone, uuid, password, full_name, email, role) VALUES (?, UUID(), ?, ?, ?, "client")',
                [phone, hashedPassword, full_name || null, cleanEmail]
            );
        }

        await pool.query(
            `INSERT IGNORE INTO loyalty_points (client_id, total_points)
       SELECT id, 0 FROM users WHERE phone = ?`,
            [phone]
        );

        const [rows] = await pool.query(
            'SELECT uuid, phone, full_name, email, role, member_since FROM users WHERE phone = ?',
            [phone]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User registration failed' },
            });
        }

        const user = rows[0];
        const { accessToken, refreshToken } = generateTokens(user.uuid, user.role);

        res.json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.uuid,
                phone: user.phone,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                member_since: user.member_since,
            },
        });
    } catch (err) {
        console.error('Complete Signup Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                error: { code: 'DUPLICATE_EMAIL', message: 'This email address is already registered with another account.' },
            });
        }
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
}

async function sendResetOTP(req, res) {
    let { phone } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_PHONE', message: 'Please provide a valid phone number' },
        });
    }

    const isRateLimited = checkRateLimit(phone);
    if (isRateLimited) {
        return res.status(429).json({
            success: false,
            error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again later.' },
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, password FROM users WHERE phone = ? AND is_active = 1',
            [phone]
        );

        if (!rows.length || !rows[0].password) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'No account found with this phone number.' },
            });
        }

        const otpCode = generateOTP();
        setOTP(phone, otpCode);

        await sendSMS(phone, `رمز إعادة تعيين كلمة المرور لريفليكتو هو: ${otpCode}`);

        const isDev = process.env.ALLOW_DEBUG_OTP === 'true';

        res.json({
            success: true,
            message: 'OTP sent successfully',
            ...(isDev && { dev_code: otpCode })
        });
    } catch (err) {
        console.error('Send Reset OTP Error:', err);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
}

async function verifyResetOTP(req, res) {
    let { phone, code } = req.body;
    if (phone) phone = phone.replace(/\s/g, '');

    if (!phone || !code) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'Phone and code are required' },
        });
    }

    const entry = getOTP(phone);
    if (!entry) {
        return res.status(401).json({
            success: false,
            error: { code: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new one.' },
        });
    }

    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
    if (entry.attempts >= maxAttempts) {
        deleteOTP(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many wrong attempts. Please request a new OTP.' },
        });
    }

    if (entry.otp !== code) {
        incrementAttempts(phone);
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_OTP', message: 'Invalid OTP code' },
        });
    }

    deleteOTP(phone);

    const resetToken = jwt.sign(
        { phone, type: 'reset' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '15m' }
    );

    res.json({
        success: true,
        message: 'OTP verified successfully',
        reset_token: resetToken,
    });
}

async function resetPassword(req, res) {
    const { reset_token, password } = req.body;

    if (!reset_token || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_FIELDS', message: 'Reset token and password are required' },
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: { code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters long' },
        });
    }

    try {
        let decoded;
        try {
            decoded = jwt.verify(reset_token, process.env.JWT_SECRET || 'default_secret');
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_RESET_TOKEN', message: 'Reset session has expired or is invalid' },
            });
        }

        if (decoded.type !== 'reset' || !decoded.phone) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_RESET_TOKEN', message: 'Invalid reset token type' },
            });
        }

        const phone = decoded.phone;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Only update the password column — all other data stays intact
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE phone = ? AND is_active = 1',
            [hashedPassword, phone]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' },
            });
        }

        res.json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
        });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
}

module.exports = {
    sendOTP,
    
    verifyOTP,
    refreshToken,
    logout,
    login,
    sendSignupOTP,
    verifySignupOTP,
    completeSignup,
    sendResetOTP,
    verifyResetOTP,
    resetPassword
};
