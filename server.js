require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('@neondatabase/serverless');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve phone images and static assets
const IMAGES_DIR = path.join(__dirname, 'images', 'phones');
app.use('/images/phones', express.static(IMAGES_DIR));
app.use(express.static(__dirname));

// Multer storage — save in memory for serverless environments
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_zFS0vR4esBQf@ep-lucky-waterfall-b36agqcv.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

// Supabase client instance (with graceful fallback)
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

// UUID validation helper to protect PostgreSQL queries from 22P02 syntax errors
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (val) => typeof val === 'string' && UUID_REGEX.test(val);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.send('ADC Gadgets Server is running!'));

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `devices/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });
    
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    
    res.json({ filename: req.file.originalname, url: publicUrlData.publicUrl });
  } catch(err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: 'Failed to upload to Supabase' });
  }
});

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-adc-gadgets-2026';

function verifyToken(req, res, next) {
    // Check for either an admin token or a user token
    const token = req.cookies.admin_auth_token || req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
}

function verifyAdmin(req, res, next) {
    // Admins must use the admin_auth_token specifically to prevent role hijacking/conflict
    const token = req.cookies.admin_auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No admin token provided' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        next();
    } catch(err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired admin token' });
    }
}

// ─── AUTH: Login, OTP, Reset Password ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getOtpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your OTP Code - ADC Gadgets</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0;">
    
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border-top: 6px solid #FF4191; padding: 40px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center;">
        
        <h1 style="color: #FF4191; margin: 0 0 10px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ADC Gadgets</h1>
        
        <p style="color: #64748b; font-size: 15px; margin: 0 0 30px 0;">Secure Login Verification</p>
        
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Here is your login code:</h2>
        
        <div style="background-color: #fce7f3; border: 1px dashed #FF4191; border-radius: 8px; padding: 20px; margin: 0 auto 30px auto; display: inline-block;">
            <span style="font-family: monospace; font-size: 36px; font-weight: bold; color: #831843; letter-spacing: 6px;">${otp}</span>
        </div>
        
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Please enter this One-Time Password (OTP) in the app to verify your identity. This code is valid for exactly <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If you did not request this code, you can safely ignore this email.<br>
                &copy; ADC Gadgets. All rights reserved.
            </p>
        </div>
        
    </div>
    
</body>
</html>
`;

// Memory store removed for serverless compatibility

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if email exists
    let result = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email not found' });
    }
    
    const user = result.rows[0];
    
    // Check password if it exists on the account
    if (user.password !== null) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    if (user.role === 'admin') {
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('admin_auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
      return res.json({ success: true, user, role: user.role });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await pool.query('UPDATE profiles SET otp_code = $1, otp_expires_at = $2 WHERE id = $3', [otp, expiresAt, user.id]);

    try {
      const info = await transporter.sendMail({
        from: `"ADC Gadgets" <${process.env.SMTP_FROM || 'no-reply@adcgadgets.com'}>`,
        to: email,
        subject: 'Your OTP Code - ADC Gadgets',
        html: getOtpTemplate(otp)
      });
      console.log(`OTP Email sent to ${email}. Response: ${info.response}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr.message);
      return res.status(500).json({ error: 'Failed to send OTP email. Please check SMTP settings.' });
    }

    res.json({ requiresOtp: true, userId: user.id, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/resend-otp', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await pool.query('UPDATE profiles SET otp_code = $1, otp_expires_at = $2 WHERE id = $3', [otp, expiresAt, userId]);

    try {
      const info = await transporter.sendMail({
        from: `"ADC Gadgets" <${process.env.SMTP_FROM || 'no-reply@adcgadgets.com'}>`,
        to: user.email,
        subject: 'Your OTP Code - ADC Gadgets',
        html: getOtpTemplate(otp)
      });
      res.json({ success: true, message: `OTP Email successfully sent to ${user.email}.` });
    } catch (emailErr) {
      console.error("Failed to resend OTP email:", emailErr.message);
      return res.status(500).json({ error: 'Failed to resend OTP email. Please check SMTP settings.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    if (!user.otp_code) {
      return res.status(400).json({ error: 'No OTP found for this user' });
    }

    const now = new Date();
    const expires = new Date(user.otp_expires_at);

    if (now > expires) return res.status(400).json({ error: 'OTP expired' });
    if (user.otp_code !== otp) return res.status(400).json({ error: 'Invalid OTP.' });

    // Clear OTP after successful verification
    await pool.query('UPDATE profiles SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1', [userId]);

    if (user.is_first_login) {
      res.json({ requiresPasswordReset: true });
    } else {
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
      res.json({ success: true, user });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE profiles SET password = $1, is_first_login = false WHERE id = $2 RETURNING *',
      [hashedPassword, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.clearCookie('admin_auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ─── PROFILES ──────────────────────────────────────────────────────────────────
app.get('/profiles', async (req, res) => {
  const { role } = req.query;
  try {
    let query = 'SELECT * FROM profiles';
    const params = [];
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/profiles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/profiles/:id/password', async (req, res) => {
  const { id } = req.params;
  const { current_password, new_password } = req.body;
  try {
    const result = await pool.query('SELECT password FROM profiles WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const isMatch = await bcrypt.compare(current_password, result.rows[0].password);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
    
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE profiles SET password = $1 WHERE id = $2', [hashedNewPassword, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profiles/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar_color } = req.body;
  try {
    const result = await pool.query(
      'UPDATE profiles SET avatar_color = $1 WHERE id = $2 RETURNING *',
      [avatar_color, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CREATE USER & LOAN (Admin action) ─────────────────────────────────────────
app.post('/api/users/create', upload.single('idImage'), async (req, res) => {
  const {
    name, full_name,
    email,
    password,
    mobile,
    address,
    idType, id_type,
    loanModel, active_loan_model,
    loanTerm, term_months,
    deviceColor
  } = req.body;

  const actualFullName = (name || full_name || '').trim();
  const actualEmail    = (email || '').trim().toLowerCase();
  const actualPassword = password || 'password123';
  const actualMobile   = mobile || '';
  const actualAddress  = address || '';
  const actualIdType   = idType || id_type || "Driver's License";
  const actualLoanModel = loanModel || active_loan_model || null;
  const actualTerm     = parseInt(loanTerm || term_months) || 24;
  let idUrl = null;
  if (req.file) {
    const base64Data = req.file.buffer.toString('base64');
    idUrl = `data:${req.file.mimetype};base64,${base64Data}`;
  }

  try {
    if (!actualEmail) return res.status(400).json({ error: 'Email is required' });
    if (!actualFullName) return res.status(400).json({ error: 'Full name is required' });

    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [actualEmail]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

    // 1. Insert Profile
    const profRes = await pool.query(
      `INSERT INTO profiles (full_name, email, mobile, address, id_type, id_url, active_loan_model, loan_term, password, role, status, is_first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'user', 'Active', true) RETURNING *`,
      [actualFullName, actualEmail, actualMobile, actualAddress, actualIdType, idUrl, actualLoanModel, actualTerm, actualPassword]
    );
    const newUser = profRes.rows[0];

    // 2. Create Loan if model selected
    let createdLoan = null;
    if (actualLoanModel) {
      const devRes = await pool.query(
        `SELECT * FROM devices WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [actualLoanModel]
      );

      let srp = 49990;
      let img = 'Iphone_15.png';
      let monthly = Math.round((srp / actualTerm) * 100) / 100;

      if (devRes.rows.length > 0) {
        const device = devRes.rows[0];
        srp = parseFloat(device.srp);
        img = device.image || `${device.name}.png`;
        monthly = (actualTerm === 24 && device.monthly)
          ? parseFloat(device.monthly)
          : Math.round((srp / actualTerm) * 100) / 100;
      }

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      const loanRes = await pool.query(
        `INSERT INTO loans (user_id, device_name, device_image, device_color, total_amount, remaining_balance, monthly_payment, term_months, next_payment_date, status)
         VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, 'active') RETURNING *`,
        [newUser.id, actualLoanModel, img, deviceColor || null, srp, monthly, actualTerm, nextDate.toISOString()]
      );
      createdLoan = loanRes.rows[0];
    }

    console.log(`[User Created] email=${newUser.email} model=${actualLoanModel} term=${actualTerm}mos monthly=₱${createdLoan?.monthly_payment}`);

    res.status(201).json({ user: newUser, loan: createdLoan });
  } catch (err) {
    console.error('Error in /api/users/create:', err);
    res.status(500).json({ error: err.message || 'Server error creating user' });
  }
});

// ─── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
app.get('/api/announcements/latest', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({ title: 'Welcome to ADC Gadgets', description: 'Stay tuned for updates!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DEVICES ───────────────────────────────────────────────────────────────────
app.get('/api/devices', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM devices ORDER BY srp DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/devices', async (req, res) => {
  const { name, appledb_id, image, storage, srp, stock, status, colors } = req.body;
  const monthly = Math.ceil(srp / 24);
  // colors should be an array; coerce just in case it arrives as a comma-string
  const colorsArr = Array.isArray(colors) ? colors : (colors ? String(colors).split(',').map(c => c.trim()).filter(Boolean) : []);
  try {
    const result = await pool.query(
      `INSERT INTO devices (name, appledb_id, image, storage, srp, monthly, stock, status, colors)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, appledb_id, image, storage, srp, monthly, stock, status || 'available', colorsArr]
    );
    const insertedDevice = result.rows[0];

    if (insertedDevice.status === 'upcoming') {
      await pool.query('INSERT INTO announcements (title, description) VALUES ($1, $2)', [
        `Coming Soon: ${insertedDevice.name}`,
        `Get ready! The ${insertedDevice.name} is coming soon to ADC Gadgets. Stay tuned for official release dates and loan pre-approvals.`
      ]);
    } else if (insertedDevice.status === 'available') {
      // New model added directly as available
      await pool.query('INSERT INTO announcements (title, description) VALUES ($1, $2)', [
        `New Arrival: ${insertedDevice.name}! 🎉`,
        `Exciting news! The ${insertedDevice.name} is now part of our lineup at ADC Gadgets. Apply for a loan today and take it home with flexible monthly plans.`
      ]);
    }

    res.status(201).json(insertedDevice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/devices/:id', async (req, res) => {
  const { id } = req.params;
  const { name, appledb_id, image, storage, srp, stock, status, colors } = req.body;
  const monthly = Math.ceil(srp / 24);
  const colorsArr = Array.isArray(colors) ? colors : (colors ? String(colors).split(',').map(c => c.trim()).filter(Boolean) : []);
  try {
    const oldDeviceRes = await pool.query('SELECT status, stock FROM devices WHERE id = $1', [id]);
    const oldStatus = oldDeviceRes.rows.length > 0 ? oldDeviceRes.rows[0].status : null;
    const oldStock  = oldDeviceRes.rows.length > 0 ? parseInt(oldDeviceRes.rows[0].stock, 10) : 0;

    const result = await pool.query(
      `UPDATE devices SET name = $1, appledb_id = $2, image = $3, storage = $4, srp = $5, monthly = $6, stock = $7, status = $8, colors = $9
       WHERE id = $10 RETURNING *`,
      [name, appledb_id, image, storage, srp, monthly, stock, status || 'available', colorsArr, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Device not found' });

    const updatedDevice = result.rows[0];
    const newStock = parseInt(updatedDevice.stock, 10);

    // Upcoming → Available (release announcement)
    if (oldStatus === 'upcoming' && updatedDevice.status === 'available') {
      await pool.query('INSERT INTO announcements (title, description) VALUES ($1, $2)', [
        `Now Available: ${updatedDevice.name}! 🎉`,
        `The wait is over! The ${updatedDevice.name} is now available at ADC Gadgets. Get yours today with our flexible loan plans.`
      ]);
    }
    // Restocked: was out of stock (0), now has stock again
    else if (oldStock <= 0 && newStock > 0 && updatedDevice.status === 'available') {
      await pool.query('INSERT INTO announcements (title, description) VALUES ($1, $2)', [
        `Back in Stock: ${updatedDevice.name}! 📦`,
        `Great news! The ${updatedDevice.name} is back in stock at ADC Gadgets. Limited units available — apply for a loan now before it runs out!`
      ]);
    }

    res.json(updatedDevice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM devices WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting device:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── LOANS ─────────────────────────────────────────────────────────────────────
app.get('/loans', async (req, res) => {
  const { user_id, all: showAll } = req.query;
  if (user_id && !isUUID(user_id)) {
    return res.json([]);
  }
  try {
    let query, params;
    if (user_id && !showAll) {
      query = `SELECT l.*, p.full_name FROM loans l
               LEFT JOIN profiles p ON l.user_id = p.id
               WHERE l.user_id = $1 AND l.status = 'active'
               ORDER BY l.created_at DESC`;
      params = [user_id];
    } else if (user_id && showAll) {
      query = `SELECT l.*, p.full_name FROM loans l
               LEFT JOIN profiles p ON l.user_id = p.id
               WHERE l.user_id = $1
               ORDER BY l.created_at DESC`;
      params = [user_id];
    } else {
      query = `SELECT l.*, p.full_name, p.email FROM loans l
               LEFT JOIN profiles p ON l.user_id = p.id
               ORDER BY l.created_at DESC`;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/loans', async (req, res) => {
  const { user_id, device_name, device_image, total_amount, monthly_payment, term_months, next_payment_date, status } = req.body;
  try {
    const term = parseInt(term_months) || 24;
    let srp = total_amount ? parseFloat(total_amount) : null;
    let monthly = monthly_payment ? parseFloat(monthly_payment) : null;
    let img = device_image;

    if (!srp || !monthly) {
      const devRes = await pool.query('SELECT * FROM devices WHERE LOWER(name) = LOWER($1) LIMIT 1', [device_name]);
      if (devRes.rows.length > 0) {
        const d = devRes.rows[0];
        srp = srp || parseFloat(d.srp);
        img = img || d.image;
        if (!monthly) {
          const interestRates = { 3: 0, 6: 0.03, 12: 0.05, 24: 0.08 };
          const interest = interestRates[term] !== undefined ? interestRates[term] : 0.08;
          monthly = Math.round(((srp * (1 + interest)) / term) * 100) / 100;
        }
      }
    }

    const nextDate = next_payment_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await pool.query(
      `INSERT INTO loans (user_id, device_name, device_image, total_amount, remaining_balance, monthly_payment, term_months, next_payment_date, status)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, device_name, img, srp, monthly, term, nextDate, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────────────────
app.get('/loans/:id/payments', async (req, res) => {
  const { id } = req.params;
  try {
    // FIX: ORDER BY DESC so newest payments appear first
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE loan_id = $1 AND payment_method != \'pending\' ORDER BY payment_date DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PAYMONGO CHECKOUT ─────────────────────────────────────────────────────────
const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE   = 'https://api.paymongo.com/v1';

async function paymongoRequest(method, path, body) {
  const auth = Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64');
  const response = await fetch(`${PAYMONGO_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return response.json();
}

app.post('/pay', async (req, res) => {
  const { loan_id, user_id } = req.body;
  try {
    // Fetch loan details
    const loanRes = await pool.query(
      `SELECT l.*, p.full_name, p.email FROM loans l
       LEFT JOIN profiles p ON l.user_id = p.id WHERE l.id = $1`,
      [loan_id]
    );
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found' });
    const loan = loanRes.rows[0];

    const amount = Math.min(parseFloat(loan.monthly_payment), parseFloat(loan.remaining_balance));
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid payment amount' });

    // Only GCash and Maya accepted
    const allowedMethods = ['gcash', 'paymaya'];

    const frontendBase = req.headers.origin || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;

    const session = await paymongoRequest('POST', '/checkout_sessions', {
      data: {
        attributes: {
          billing: {
            name: loan.full_name || 'ADC Customer',
            email: loan.email || 'customer@adc.com'
          },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          cancel_url: `${frontendBase}/src/user/loan.html?payment=cancel&loan_id=${loan_id}`,
          success_url: `${frontendBase}/src/user/loan.html?payment=success&loan_id=${loan_id}&session_id={id}`,
          description: `Monthly payment for ${loan.device_name}`,
          payment_method_types: allowedMethods,
          line_items: [{
            currency: 'PHP',
            amount: Math.round(amount * 100),
            description: `${loan.device_name} — Monthly Installment`,
            name: `ADC Gadgets Loan Payment`,
            quantity: 1
          }],
          metadata: { loan_id, user_id }
        }
      }
    });

    if (session.errors) {
      console.error('PayMongo error:', session.errors);
      return res.status(400).json({ error: session.errors[0]?.detail || 'PayMongo error' });
    }

    const checkout_url = session.data?.attributes?.checkout_url;
    const session_id   = session.data?.id;

    // Clean up older abandoned pending rows for this loan
    await pool.query(
      `DELETE FROM payments WHERE loan_id = $1 AND payment_method = 'pending' AND payment_date < NOW() - INTERVAL '30 minutes'`,
      [loan_id]
    ).catch(() => {});

    // Store pending row so we can confirm it after redirect
    await pool.query(
      `INSERT INTO payments (loan_id, amount_paid, payment_date, payment_method, checkout_session_id, payment_intent_id)
       VALUES ($1, $2, NOW(), 'pending', $3, NULL)`,
      [loan_id, amount, session_id]
    );

    res.json({ checkout_url, session_id });
  } catch (err) {
    console.error('PayMongo /pay error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Called when user returns from PayMongo with ?payment=success
// Confirms the session, resolves the real payment method, updates balance & next_payment_date
app.post('/pay/confirm', async (req, res) => {
  const { loan_id, session_id } = req.body;
  if (!loan_id && !session_id) return res.status(400).json({ error: 'loan_id or session_id required' });

  try {
    // Clean up session_id (PayMongo doesn't interpolate '{id}')
    const cleanSessionId = (session_id && session_id !== '{id}' && session_id !== '%7Bid%7D')
      ? session_id.trim()
      : null;

    // ── Step 1: Find the pending payment row ──────────────────────────────────
    let pendingRow = null;

    if (cleanSessionId) {
      const r = await pool.query(
        `SELECT * FROM payments WHERE checkout_session_id = $1 LIMIT 1`,
        [cleanSessionId]
      );
      pendingRow = r.rows[0] || null;
    }

    if (!pendingRow && loan_id) {
      // Fallback: most recent pending payment for this loan
      const r = await pool.query(
        `SELECT * FROM payments WHERE loan_id = $1 AND payment_method = 'pending'
         ORDER BY payment_date DESC LIMIT 1`,
        [loan_id]
      );
      pendingRow = r.rows[0] || null;
    }

    // Check if this session was already confirmed earlier
    if (!pendingRow && cleanSessionId) {
      const already = await pool.query(
        `SELECT * FROM payments WHERE checkout_session_id = $1 LIMIT 1`,
        [cleanSessionId]
      );
      if (already.rows.length > 0 && already.rows[0].payment_method !== 'pending') {
        return res.json({
          success: true,
          payment_method: already.rows[0].payment_method,
          amount_paid: parseFloat(already.rows[0].amount_paid),
          already_confirmed: true
        });
      }
    }

    if (!pendingRow) {
      return res.status(404).json({ error: 'No pending payment found for this loan' });
    }

    // Guard: row was already confirmed (concurrent request or webhook already handled it)
    if (pendingRow.payment_method !== 'pending') {
      return res.json({
        success: true,
        payment_method: pendingRow.payment_method,
        amount_paid: parseFloat(pendingRow.amount_paid),
        already_confirmed: true
      });
    }

    const actualLoanId = pendingRow.loan_id || loan_id;
    const amountPaid   = parseFloat(pendingRow.amount_paid);
    const checkoutId   = cleanSessionId || pendingRow.checkout_session_id;

    // ── Step 2: PayMongo verification for real method label ───────
    let methodLabel = 'GCash'; // default
    let intentId    = null;

    if (checkoutId) {
      try {
        const sessionData = await paymongoRequest('GET', `/checkout_sessions/${checkoutId}`);
        const attrs = sessionData.data?.attributes;

        if (attrs) {
          // PayMongo checkout sessions:
          // attrs.paid_at is set when paid
          // attrs.payments has items with status 'paid'
          // attrs.payment_intent has status 'succeeded'
          const hasPaidPayment = attrs.payments && attrs.payments.some(p => p.attributes?.status === 'paid');
          const isPaid = !!(attrs.paid_at || hasPaidPayment || attrs.payment_intent?.attributes?.status === 'succeeded');

          if (attrs.payments && attrs.payments.length === 0 && !attrs.paid_at && attrs.status === 'active') {
            console.warn(`[pay/confirm] PayMongo checkout session ${checkoutId} has 0 payments and no paid_at`);
          }

          const rawMethod = attrs.payment_method_used
            || attrs.payments?.[0]?.attributes?.source?.type
            || attrs.payments?.[0]?.attributes?.payment_method_type
            || null;

          if (rawMethod) {
            const m = rawMethod.toLowerCase();
            if (m.includes('maya') || m === 'paymaya') {
              methodLabel = 'Maya';
            } else if (m.includes('gcash')) {
              methodLabel = 'GCash';
            } else {
              methodLabel = rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1);
            }
          }

          intentId = attrs.payment_intent?.id || attrs.payments?.[0]?.attributes?.payment_intent_id || null;
        }
      } catch (e) {
        console.warn('/pay/confirm: PayMongo verify error, continuing:', e.message);
      }
    }

    // ── Step 3: Confirm the pending payment row atomically ────────────────────
    const updatePay = await pool.query(
      `UPDATE payments 
       SET payment_method = $1, payment_date = NOW(), payment_intent_id = COALESCE($2, payment_intent_id)
       WHERE id = $3 AND payment_method = 'pending'
       RETURNING *`,
      [methodLabel, intentId, pendingRow.id]
    );

    if (updatePay.rowCount === 0) {
      // Concurrently processed
      return res.json({ success: true, payment_method: methodLabel, amount_paid: amountPaid });
    }

    // ── Step 4: Update loan balance & advance next_payment_date ──────────────
    const loanRes = await pool.query(
      `SELECT remaining_balance, next_payment_date FROM loans WHERE id = $1`,
      [actualLoanId]
    );
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found' });
    const loan = loanRes.rows[0];

    // Advance by 1 month from current next_payment_date
    const currentNextDate = new Date(loan.next_payment_date);
    const newNextDate = new Date(currentNextDate);
    newNextDate.setMonth(newNextDate.getMonth() + 1);
    const newBalance = Math.max(parseFloat(loan.remaining_balance) - amountPaid, 0);

    await pool.query(
      `UPDATE loans SET remaining_balance = $1, next_payment_date = $2 WHERE id = $3`,
      [newBalance, newNextDate.toISOString(), actualLoanId]
    );

    if (newBalance < 1) {
      await pool.query(`UPDATE loans SET status = 'completed' WHERE id = $1`, [actualLoanId]);
      await pool.query(`UPDATE profiles SET active_loan_model = NULL WHERE id = (SELECT user_id FROM loans WHERE id = $1)`, [actualLoanId]);
    }

    console.log(`[pay/confirm] loan=${actualLoanId} ₱${amountPaid} via ${methodLabel} | bal: ${loan.remaining_balance}→${newBalance} | next: ${newNextDate.toDateString()}`);

    res.json({
      success: true,
      payment_method: methodLabel,
      amount_paid: amountPaid,
      remaining_balance: newBalance,
      next_payment_date: newNextDate.toISOString()
    });
  } catch (err) {
    console.error('/pay/confirm error:', err);
    res.status(500).json({ error: 'Server error confirming payment' });
  }
});

// PayMongo Webhook — fires when payment.paid event is received
app.post('/pay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    if (event.data?.attributes?.type !== 'payment.paid') return res.sendStatus(200);

    const payment     = event.data.attributes.data;
    const metadata    = payment?.attributes?.metadata || {};
    const loan_id     = metadata.loan_id;
    const amount_paid = payment?.attributes?.amount / 100; // centavos → pesos
    const rawMethod   = payment?.attributes?.source?.type || 'online';
    const method      = (rawMethod === 'paymaya' || rawMethod === 'maya') ? 'Maya' : (rawMethod === 'gcash' ? 'GCash' : rawMethod);
    const intent_id   = payment?.id;

    if (!loan_id || !amount_paid) return res.sendStatus(200);

    // Update pending payment row (only if pending to avoid double-processing)
    const updatePay = await pool.query(
      `UPDATE payments SET payment_method = $1, payment_intent_id = $2, payment_date = NOW()
       WHERE loan_id = $3 AND payment_method = 'pending'`,
      [method, intent_id, loan_id]
    );

    // If no pending row was updated, it was already processed by /pay/confirm
    if (updatePay.rowCount === 0) {
      return res.sendStatus(200);
    }

    // Deduct from remaining balance & advance next payment date by 1 month
    const loanRes = await pool.query('SELECT remaining_balance, next_payment_date FROM loans WHERE id = $1', [loan_id]);
    if (loanRes.rows.length > 0) {
      const loan = loanRes.rows[0];
      const curDate = new Date(loan.next_payment_date);
      const newNextDate = new Date(curDate);
      newNextDate.setMonth(newNextDate.getMonth() + 1);
      const newBal = Math.max(parseFloat(loan.remaining_balance) - amount_paid, 0);

      await pool.query(
        'UPDATE loans SET remaining_balance = $1, next_payment_date = $2 WHERE id = $3',
        [newBal, newNextDate.toISOString(), loan_id]
      );

      if (newBal < 1) {
        await pool.query("UPDATE loans SET status = 'completed' WHERE id = $1", [loan_id]);
        await pool.query("UPDATE profiles SET active_loan_model = NULL WHERE id = (SELECT user_id FROM loans WHERE id = $1)", [loan_id]);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);

  }
});

// Manual payment record (admin cash / internal use)
app.post('/pay/record', async (req, res) => {
  const { loan_id, amount_paid, payment_method, payment_date } = req.body;
  try {
    if (!loan_id || !amount_paid) return res.status(400).json({ error: 'loan_id and amount_paid are required' });
    await pool.query(
      `INSERT INTO payments (loan_id, amount_paid, payment_date, payment_method) VALUES ($1, $2, $3, $4)`,
      [loan_id, amount_paid, payment_date || new Date().toISOString(), payment_method || 'cash']
    );
    await pool.query(
      'UPDATE loans SET remaining_balance = GREATEST(remaining_balance - $1, 0), next_payment_date = $2 WHERE id = $3',
      [amount_paid, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), loan_id]
    );
    const updated = await pool.query('SELECT remaining_balance FROM loans WHERE id = $1', [loan_id]);
    if (updated.rows.length > 0 && parseFloat(updated.rows[0].remaining_balance) < 1) {
      await pool.query("UPDATE loans SET status = 'completed' WHERE id = $1", [loan_id]);
      await pool.query("UPDATE profiles SET active_loan_model = NULL WHERE id = (SELECT user_id FROM loans WHERE id = $1)", [loan_id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── LOAN LEDGER ────────────────────────────────────────────────────────────────
app.get('/loans/:id/ledger', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(404).json({ error: 'Loan not found' });
    const loanRes = await pool.query(
      `SELECT l.*, p.full_name, p.email, p.mobile, p.address, p.id_type
       FROM loans l JOIN profiles p ON l.user_id = p.id WHERE l.id = $1`,
      [id]
    );
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found' });
    const paymentsRes = await pool.query('SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date ASC', [id]);
    res.json({ loan: loanRes.rows[0], payments: paymentsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────────
app.get('/dashboard/stats', async (req, res) => {
  try {
    const loanStats = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_srp,
        COALESCE(SUM(remaining_balance), 0) AS total_remaining,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_loans,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_loans,
        COALESCE(SUM(CASE WHEN status = 'active' THEN monthly_payment ELSE 0 END), 0) AS monthly_collections,
        COUNT(CASE WHEN status = 'active' AND next_payment_date > NOW() + INTERVAL '3 days' THEN 1 END) AS on_time,
        COUNT(CASE WHEN status = 'active' AND next_payment_date BETWEEN NOW() AND NOW() + INTERVAL '3 days' THEN 1 END) AS due_soon,
        COUNT(CASE WHEN status = 'active' AND next_payment_date < NOW() THEN 1 END) AS late,
        COUNT(*) AS total_loans
      FROM loans
    `);

    const userCount = await pool.query("SELECT COUNT(*) FROM profiles WHERE role = 'user'");

    const recentLoans = await pool.query(`
      SELECT l.id, l.user_id, l.device_name, l.device_color, l.total_amount, l.monthly_payment, l.remaining_balance, l.status, l.created_at,
             p.full_name, p.email
      FROM loans l
      LEFT JOIN profiles p ON l.user_id = p.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `);

    // Recent payments (for Sales tab transactions table)
    // Include all non-pending payments; 'pending' rows are ones that haven't been confirmed yet
    const recentPayments = await pool.query(`
      SELECT
        pay.id,
        pay.loan_id,
        pay.amount_paid,
        pay.payment_date,
        pay.payment_method,
        l.device_name, l.device_color,
        l.user_id,
        p.full_name,
        p.email
      FROM payments pay
      JOIN loans l ON pay.loan_id = l.id
      LEFT JOIN profiles p ON l.user_id = p.id
      WHERE pay.payment_method != 'pending'
      ORDER BY pay.payment_date DESC
      LIMIT 50
    `);

    // Total cash actually collected from payments
    const totalCollected = await pool.query(`
      SELECT COALESCE(SUM(amount_paid), 0) AS total
      FROM payments
      WHERE payment_method != 'pending'
    `);

    // Unread messages count
    const unreadMsgs = await pool.query(`
      SELECT COUNT(*) as count
      FROM chats
      WHERE sender = 'user' AND is_read = false
    `);

    const stats = loanStats.rows[0];
    res.json({
      totalSrp: parseFloat(stats.total_srp),
      totalRemainingBalance: parseFloat(stats.total_remaining),
      activeLoans: parseInt(stats.active_loans),
      completedLoans: parseInt(stats.completed_loans),
      totalLoans: parseInt(stats.total_loans),
      monthlyCollections: parseFloat(stats.monthly_collections),
      onTime: parseInt(stats.on_time || 0),
      dueSoon: parseInt(stats.due_soon || 0),
      late: parseInt(stats.late || 0),
      totalUsers: parseInt(userCount.rows[0].count),
      unreadMessages: parseInt(unreadMsgs.rows[0].count),
      totalPaymentsCollected: parseFloat(totalCollected.rows[0].total),
      recentLoans: recentLoans.rows,
      recentPayments: recentPayments.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── CHATS / COMMUNICATIONS ────────────────────────────────────────────────────
app.get('/chats/conversations', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (c.user_id) c.user_id, c.message, c.created_at, c.is_read, c.sender,
             p.full_name AS profile_full_name, p.email AS profile_email, p.active_loan_model AS profile_active_loan_model, p.avatar_color AS profile_avatar_color
      FROM chats c
      LEFT JOIN profiles p ON c.user_id::text = p.id::text
      ORDER BY c.user_id, c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/chats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/chats', async (req, res) => {
  const { user_id, message, sender } = req.body;
  try {
    const finalSender = sender || 'user';
    const result = await pool.query(
      `INSERT INTO chats (user_id, message, sender, is_read) VALUES ($1, $2, $3, false) RETURNING *`,
      [user_id, message, finalSender]
    );
    const insertedMsg = result.rows[0];

    // Trigger AI Assistant
    if (finalSender === 'user') {
      const lower = message.toLowerCase();
      const wantsHuman = lower.includes('human') || lower.includes('admin') || lower.includes('agent') || lower.includes('support') || lower.includes('talk to');
      
      if (!wantsHuman) {
        // We MUST await this so Vercel Serverless doesn't kill the background process!
        await handleAIAssistant(user_id, message).catch(err => console.error("AI Error:", err));
      }
    }

    res.status(201).json(insertedMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function handleAIAssistant(userId, userMessage) {
    let aiResponse = "";
    let contextInfo = "";
    let profile = null;
    let activeLoan = null;
    let completedLoan = null;
    
    try {
        const userRes = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
        profile = userRes.rows[0];
        
        const loanRes = await pool.query("SELECT * FROM loans WHERE user_id = $1 AND status IN ('active', 'pending') ORDER BY created_at DESC LIMIT 1", [userId]);
        activeLoan = loanRes.rows[0];

        const completedLoanRes = await pool.query("SELECT * FROM loans WHERE user_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1", [userId]);
        completedLoan = completedLoanRes.rows[0];
        
        if (profile) {
            contextInfo += `You are talking to ${profile.full_name || 'a customer'}. `;
            if (activeLoan) {
                contextInfo += `They currently have an active loan for a ${activeLoan.device_name}. Their total loan amount is ₱${activeLoan.total_amount}. Their remaining balance is ₱${activeLoan.remaining_balance}. Their next monthly payment is ₱${activeLoan.monthly_payment} due on ${activeLoan.next_payment_date}. `;
            } else if (completedLoan) {
                contextInfo += `They do NOT have any active loans right now. Their previous loan for a ${completedLoan.device_name} has been fully settled and completed. If they ask whether they have an active loan, explicitly confirm that they do not have any active loans, and mention that their ${completedLoan.device_name} loan is completely paid off. `;
            } else {
                contextInfo += `They do not have an active loan right now. `;
            }
        }
        
                // Fetch Live Inventory
        const deviceRes = await pool.query("SELECT name, storage, srp FROM devices WHERE status = 'available' AND stock > 0");
        if (deviceRes.rows.length > 0) {
            contextInfo += "CURRENTLY IN STOCK DEVICES: ";
            deviceRes.rows.forEach(d => {
                contextInfo += `${d.name} (${d.storage}) Base Cash Price: ₱${d.srp}. `;
            });
        } else {
            contextInfo += "Currently, we have no devices in stock. ";
        }
        
        contextInfo += "AMORTIZATION RULES (CRITICAL): If a user asks for the monthly payment of a device, explain that we offer flexible terms. Calculate the exact monthly payment using these rules: 3 months (0% interest), 6 months (3% total interest), 12 months (5% total interest), 24 months (8% total interest). Formula: (Cash Price * (1 + Interest)) / Months. Example for ₱10000 device at 12 months: (10000 * 1.05) / 12 = ₱875/mo.";
        
        contextInfo += "CRITICAL LIMITATIONS: You CANNOT email transaction histories, you CANNOT process manual payments, and you CANNOT add payment logs. If the user asks for ANY of these, or anything beyond simple account questions, you MUST explicitly say: 'I cannot perform that action. I am transferring this conversation to a human administrator. Please wait for an Admin to assist you.'";

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 10) {
            throw new Error("No valid Gemini API key found");
        }

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.8-flash",
            systemInstruction: `You are ADC Assistant, the official AI chatbot for ADC Gadgets. You help customers with their device loans and inquiries. Keep your answers brief, friendly, and professional (1-3 sentences). Use Markdown for formatting (like **bold** or bullet points) if helpful.\n\n[SYSTEM CONTEXT: ${contextInfo}]`
        });

                // Fetch Chat History for Conversational Memory (ROBUST METHOD)
        const historyRes = await pool.query(
            "SELECT sender, message FROM chats WHERE user_id = $1 ORDER BY created_at ASC LIMIT 10",
            [userId]
        );
        
        let memoryText = "--- PAST CONVERSATION HISTORY ---\n";
        // We do length - 1 to exclude the message the user JUST sent (since it's already in the DB)
        for (let i = 0; i < historyRes.rows.length - 1; i++) {
            const row = historyRes.rows[i];
            const roleName = row.sender === 'user' ? 'Customer' : 'ADC Assistant';
            memoryText += `${roleName}: ${row.message}\n`;
        }
        memoryText += "--- END HISTORY ---\n\n";

        const prompt = `[SYSTEM CONTEXT: ${contextInfo}]\n\n${memoryText}Customer: ${userMessage}\nADC Assistant:`;

        const result = await model.generateContent(prompt);
        aiResponse = result.response.text();

    } catch(err) {
        console.error("AI API failed (using Mock AI fallback):", err.message);
        
        // MOCK AI FALLBACK FOR SCHOOL PRESENTATION
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes("balance") || lowerMsg.includes("how much") || lowerMsg.includes("pay")) {
            if (activeLoan) {
                const bal = parseFloat(activeLoan.remaining_balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
                const nextDate = activeLoan.next_payment_date ? new Date(activeLoan.next_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'soon';
                const mpay = parseFloat(activeLoan.monthly_payment).toLocaleString('en-US', { minimumFractionDigits: 2 });
                aiResponse = `Your remaining balance for the ${activeLoan.device_name} is **₱${bal}**. Your next monthly installment of **₱${mpay}** is due on **${nextDate}**.`;
            } else if (completedLoan) {
                aiResponse = `You currently have **₱0.00** remaining balance! Your previous loan for the ${completedLoan.device_name} has been fully settled and completed.`;
            } else {
                aiResponse = `You do not currently have an active balance on your account. Let me know if you want to apply for a new device!`;
            }
        } else if (lowerMsg.includes("name") || lowerMsg.includes("who am i")) {
            const userName = profile ? (profile.full_name || profile.email.split('@')[0]) : "there";
            aiResponse = `Yes! I know you are **${userName}**. How can I assist you with your ADC Gadgets account today?`;
        } else if (lowerMsg.includes("active loan") || lowerMsg.includes("do i have loans") || lowerMsg.includes("do i have active") || lowerMsg.includes("my loans")) {
            if (activeLoan) {
                const bal = parseFloat(activeLoan.remaining_balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
                aiResponse = `Yes! Based on our records, you have an active loan for a **${activeLoan.device_name}** with a remaining balance of **₱${bal}**. Let me know if you need specific details about your payments!`;
            } else if (completedLoan) {
                aiResponse = `Based on our records, you do not have any active loans right now. Your previous loan for the **${completedLoan.device_name}** has been fully settled and completed! Would you like to apply for a new device?`;
            } else {
                aiResponse = "Based on our records, you do not have an active loan right now. Are you interested in getting a new device?";
            }
        } else if (lowerMsg.includes("transaction history") || lowerMsg.includes("manual payment") || lowerMsg.includes("payment log")) {
            aiResponse = "I cannot perform that action. I am transferring this conversation to a human administrator. Please wait for an Admin to assist you.";
        } else {
            if (activeLoan) {
                const bal = parseFloat(activeLoan.remaining_balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
                aiResponse = `I am the ADC Assistant! You currently have an active loan for a **${activeLoan.device_name}** with a remaining balance of **₱${bal}**. You can ask me about your balance, next due date, or available devices!`;
            } else {
                aiResponse = "I am the ADC Assistant! I can help answer questions about our devices, monthly installment plans, and account status. If you have a complex request, simply type 'Talk to human' to reach our Admin team.";
            }
        }
    }

    try {
        await pool.query(
            `INSERT INTO chats (user_id, message, sender, is_read) VALUES ($1, $2, $3, false)`,
            [userId, aiResponse, 'ai']
        );
    } catch(dbErr) {
        console.error("Failed to insert AI message:", dbErr);
    }
}


app.put('/chats/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE chats SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── DB MIGRATION (run once to add new columns) ────────────────────────────────
app.post('/api/admin/migrate', async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE loans
        ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS tracking_number TEXT,
        ADD COLUMN IF NOT EXISTS last_contacted_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS follow_up_notes TEXT
    `);
    res.json({ success: true, message: 'Migration completed successfully.' });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ID UPLOAD (User can upload their government ID) ───────────────────────────
const idStorage = multer.memoryStorage();
const idUpload = multer({ storage: idStorage, limits: { fileSize: 10 * 1024 * 1024 } });
app.use('/uploads/ids', express.static(path.join(__dirname, 'uploads', 'ids')));

app.post('/api/profiles/:id/upload-id', idUpload.single('idImage'), async (req, res) => {
  const { id } = req.params;
  const { id_type } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `ids/${id}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });
    
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    const idUrl = publicUrlData.publicUrl;

    const result = await pool.query(
      `UPDATE profiles SET id_url = $1, id_type = COALESCE($2, id_type) WHERE id = $3 RETURNING id, id_url, id_type`,
      [idUrl, id_type || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, id_url: idUrl, id_type: result.rows[0].id_type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ADMIN TASK APIs (Protected) ────────────────────────────────────────────────

// Missing Documents: customers with active loans but no id_url uploaded
app.get('/api/admin/missing-documents', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT p.id, p.full_name, p.email, p.mobile, p.id_url,
             l.id AS loan_id, l.device_name, l.device_color, l.created_at AS loan_created_at
      FROM profiles p
      JOIN loans l ON l.user_id = p.id
      WHERE p.role = 'user'
        AND l.status = 'active'
        AND (p.id_url IS NULL OR p.id_url = '')
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Overdue Loans: active loans where next_payment_date is in the past
app.get('/api/admin/overdue-loans', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT l.id, l.user_id, l.device_name, l.device_color, l.remaining_balance, l.monthly_payment,
             l.next_payment_date, l.last_contacted_date, l.follow_up_notes,
             p.full_name, p.email, p.mobile
      FROM loans l
      JOIN profiles p ON l.user_id = p.id
      WHERE l.status = 'active'
        AND l.next_payment_date < NOW()
      ORDER BY l.next_payment_date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pending Fulfillment: active loans where device hasn't been delivered yet
app.get('/api/admin/pending-fulfillment', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT l.id, l.user_id, l.device_name, l.device_color, l.device_image, l.created_at,
             l.fulfillment_status, l.tracking_number,
             p.full_name, p.email, p.mobile, p.address
      FROM loans l
      JOIN profiles p ON l.user_id = p.id
      WHERE l.status = 'active'
        AND (l.fulfillment_status IS NULL OR l.fulfillment_status != 'delivered')
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Fulfillment: set fulfillment_status and/or tracking_number for a loan
app.post('/api/admin/update-fulfillment', async (req, res) => {
  const { loan_id, fulfillment_status, tracking_number } = req.body;
  if (!loan_id) return res.status(400).json({ error: 'loan_id is required' });
  try {
    const result = await pool.query(
      `UPDATE loans SET fulfillment_status = COALESCE($1, fulfillment_status),
       tracking_number = COALESCE($2, tracking_number) WHERE id = $3 RETURNING *`,
      [fulfillment_status, tracking_number, loan_id]
    );
    res.json({ success: true, loan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update follow-up notes and last_contacted_date for a loan
app.post('/api/admin/update-followup', async (req, res) => {
  const { loan_id, follow_up_notes } = req.body;
  if (!loan_id) return res.status(400).json({ error: 'loan_id is required' });
  try {
    const result = await pool.query(
      `UPDATE loans SET follow_up_notes = $1, last_contacted_date = NOW() WHERE id = $2 RETURNING *`,
      [follow_up_notes, loan_id]
    );
    res.json({ success: true, loan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Nudge: send a system chat message to a user (document reminder or payment reminder)
app.post('/api/admin/nudge', async (req, res) => {
  const { user_id, type } = req.body; // type: 'document' | 'payment'
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  try {
    // Get the user's loan info for personalized message
    const loanRes = await pool.query(
      `SELECT l.monthly_payment, l.next_payment_date FROM loans l WHERE l.user_id = $1 AND l.status = 'active' LIMIT 1`,
      [user_id]
    );
    const loan = loanRes.rows[0];

    let message;
    if (type === 'document') {
      message = `📋 Hi! This is a reminder from ADC Gadgets. We noticed your government-issued ID is not yet on file. Please log in to your account, go to the Account page, and upload a clear photo of your valid ID. This is required to keep your account in good standing. Thank you! 🙏`;
    } else if (type === 'payment' && loan) {
      const dueDate = new Date(loan.next_payment_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
      const amount = parseFloat(loan.monthly_payment).toLocaleString('en-PH', { minimumFractionDigits: 2 });
      message = `💳 Friendly reminder from ADC Gadgets: Your monthly payment of ₱${amount} is currently overdue (was due ${dueDate}). Please process your payment at your earliest convenience to avoid any account issues. You can pay via GCash or Maya in the Loan section of the app. Thank you! 🙏`;
    } else {
      message = `📣 Hello! You have a pending action on your ADC Gadgets account. Please log in and check your account for details. Thank you!`;
    }

    // Insert into support_chats (if it exists and has the right schema)
    try {
      await pool.query(
        `INSERT INTO support_chats (user_id, sender_role, message, is_read) VALUES ($1, 'admin', $2, false)`,
        [user_id, message]
      );
    } catch (scErr) {
      console.warn('[nudge] support_chats insert failed (table may differ):', scErr.message);
    }

    // Insert into chats table (used by the in-app support chat)
    await pool.query(
      `INSERT INTO chats (user_id, message, sender, is_read) VALUES ($1, $2, 'admin', false)`,
      [user_id, message]
    );

    res.json({ success: true, message: 'Nudge sent to customer chat.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Improved cash payment — properly advances next_payment_date by 1 month from current date
app.post('/api/admin/add-cash-payment', async (req, res) => {
  const { loan_id, amount_paid } = req.body;
  if (!loan_id || !amount_paid) return res.status(400).json({ error: 'loan_id and amount_paid are required' });
  if (!isUUID(loan_id)) return res.status(400).json({ error: 'Invalid loan ID format' });
  try {
    const loanRes = await pool.query('SELECT * FROM loans WHERE id = $1', [loan_id]);
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found' });
    const loan = loanRes.rows[0];

    const paid = parseFloat(amount_paid);
    const newBalance = Math.max(parseFloat(loan.remaining_balance) - paid, 0);

    // Advance next_payment_date by 1 month from current next_payment_date
    const currentNextDate = new Date(loan.next_payment_date);
    const newNextDate = new Date(currentNextDate);
    newNextDate.setMonth(newNextDate.getMonth() + 1);

    const manualSessionId = 'manual_cash_' + Date.now() + '_' + Math.floor(Math.random()*1000);

    await pool.query(
      `INSERT INTO payments (loan_id, amount_paid, payment_date, payment_method, checkout_session_id)
       VALUES ($1, $2, NOW(), 'cash', $3)`,
      [loan_id, paid, manualSessionId]
    );

    await pool.query(
      `UPDATE loans SET remaining_balance = $1, next_payment_date = $2 WHERE id = $3`,
      [newBalance, newNextDate.toISOString(), loan_id]
    );

    if (newBalance < 1) {
      await pool.query(`UPDATE loans SET status = 'completed' WHERE id = $1`, [loan_id]);
      await pool.query(`UPDATE profiles SET active_loan_model = NULL WHERE id = (SELECT user_id FROM loans WHERE id = $1)`, [loan_id]);
    }

    console.log(`[Cash Payment] loan=${loan_id} ₱${paid} | bal: ${loan.remaining_balance}→${newBalance} | next: ${newNextDate.toDateString()}`);
    res.json({ success: true, new_balance: newBalance, next_payment_date: newNextDate.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── ADMIN CHART DATA ────────────────────────────────────────────────────────
app.get('/api/admin/chart-data', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(payment_date, 'Mon YYYY') as month_label,
        TO_CHAR(payment_date, 'YYYY-MM') as sort_key,
        SUM(amount_paid) as total_collected
      FROM payments
      WHERE payment_method != 'pending'
      GROUP BY sort_key, month_label
      ORDER BY sort_key ASC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ADMIN EMAIL STATEMENT ────────────────────────────────────────────────────
app.post('/api/admin/email-statement', verifyAdmin, async (req, res) => {
  const { loan_id } = req.body;
  if (!loan_id) return res.status(400).json({ error: 'loan_id is required' });
  if (!isUUID(loan_id)) return res.status(400).json({ error: 'Invalid loan ID format' });

  try {
    // 1. Fetch Loan & User details
    const loanQuery = `
      SELECT l.*, p.email, p.full_name, p.mobile, p.address 
      FROM loans l
      JOIN profiles p ON l.user_id = p.id
      WHERE l.id = $1
    `;
    const loanRes = await pool.query(loanQuery, [loan_id]);
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found' });
    const loan = loanRes.rows[0];

    if (!loan.email) return res.status(400).json({ error: 'User does not have an email address.' });

    // 2. Fetch Payment History
    const payRes = await pool.query(
      "SELECT * FROM payments WHERE loan_id = $1 AND payment_method != 'pending' ORDER BY payment_date ASC",
      [loan_id]
    );
    const payments = payRes.rows;

    // 3. Build HTML Table
    let currentBalance = parseFloat(loan.total_amount);
    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; text-align: left;">
        <thead>
          <tr style="background-color: #fce7f3; color: #831843;">
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8;">Date</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8;">Description</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8; text-align: right;">Amount Paid</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8; text-align: right;">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">${new Date(loan.created_at).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; font-weight: bold;">Loan Issued</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right;">-</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: bold;">₱${currentBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
          </tr>
    `;

    for (const p of payments) {
      currentBalance -= parseFloat(p.amount_paid);
      tableHtml += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">${new Date(p.payment_date).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">Payment Received (${p.payment_method})</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; color: #16a34a;">- ₱${parseFloat(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: bold;">₱${currentBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
          </tr>
      `;
    }

    tableHtml += `
        </tbody>
      </table>
    `;

    // 4. Construct Final Email
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #fbcfe8; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #FF4191; margin: 0;">ADC Gadgets</h1>
          <h2 style="color: #64748b; font-size: 16px; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Statement of Account</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap;">
          <div style="margin-bottom: 16px; margin-right: 20px;">
            <p style="margin: 4px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: bold;">Billed To</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${loan.full_name || 'Customer'}</p>
            <p style="margin: 4px 0; font-size: 14px;">${loan.email}</p>
            <p style="margin: 0; font-size: 14px;">${loan.mobile || ''}</p>
          </div>
          <div>
            <p style="margin: 4px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: bold;">Contract Details</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${loan.device_name}</p>
            <p style="margin: 4px 0; font-size: 14px;">Total SRP: ₱${parseFloat(loan.total_amount).toLocaleString('en-US', {minimumFractionDigits:2})}</p>
            <p style="margin: 0; font-size: 14px;">Status: <strong style="color: ${loan.status === 'completed' ? '#16a34a' : '#FF4191'}">${loan.status.toUpperCase()}</strong></p>
          </div>
        </div>

        <h3 style="margin-bottom: 8px; color: #333; font-size: 16px;">Transaction Ledger</h3>
        ${tableHtml}

        <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">Remaining Balance: <span style="color: #FF4191;">₱${parseFloat(loan.remaining_balance).toLocaleString('en-US', {minimumFractionDigits:2})}</span></p>
          ${loan.status !== 'completed' ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">Next Payment Due: ${new Date(loan.next_payment_date).toLocaleDateString()}</p>` : `<p style="margin: 8px 0 0 0; font-size: 14px; color: #16a34a; font-weight: bold;">Congratulations! This device is fully paid.</p>`}
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
          This is an automatically generated receipt from the ADC Gadgets Administration System.<br>If you have any questions, please contact support.
        </p>
      </div>
    `;

    // 5. Send Email
    await transporter.sendMail({
      from: `"ADC Gadgets" <${process.env.SMTP_FROM || 'no-reply@adcgadgets.com'}>`,
      to: loan.email,
      subject: `Statement of Account: ${loan.device_name} - ADC Gadgets`,
      html: htmlEmail
    });

    res.json({ success: true, message: 'Statement emailed successfully.' });

  } catch (err) {
    console.error('Error emailing statement:', err);
    res.status(500).json({ error: 'Failed to send email statement: ' + (err.message || 'Server error') });
  }
});

// ─── USER EMAIL STATEMENT (User side) ─────────────────────────────────────────
app.post('/api/user/email-statement', verifyToken, async (req, res) => {
  const { loan_id } = req.body;
  if (!loan_id) return res.status(400).json({ error: 'loan_id is required' });
  if (!isUUID(loan_id)) return res.status(400).json({ error: 'Invalid loan ID format' });

  try {
    const loanQuery = `
      SELECT l.*, p.email, p.full_name, p.mobile, p.address 
      FROM loans l
      JOIN profiles p ON l.user_id = p.id
      WHERE l.id = $1 AND l.user_id = $2
    `;
    const loanRes = await pool.query(loanQuery, [loan_id, req.user.id]);
    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found or access denied.' });
    const loan = loanRes.rows[0];

    if (!loan.email) return res.status(400).json({ error: 'User does not have an email address.' });

    const payRes = await pool.query(
      "SELECT * FROM payments WHERE loan_id = $1 AND payment_method != 'pending' ORDER BY payment_date ASC",
      [loan_id]
    );
    const payments = payRes.rows;

    let currentBalance = parseFloat(loan.total_amount);
    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; text-align: left;">
        <thead>
          <tr style="background-color: #fce7f3; color: #831843;">
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8;">Date</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8;">Description</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8; text-align: right;">Amount Paid</th>
            <th style="padding: 12px; border-bottom: 2px solid #fbcfe8; text-align: right;">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">${new Date(loan.created_at).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; font-weight: bold;">Loan Issued</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right;">-</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: bold;">₱${currentBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
          </tr>
    `;

    for (const p of payments) {
      currentBalance -= parseFloat(p.amount_paid);
      tableHtml += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">${new Date(p.payment_date).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">Payment Received (${p.payment_method})</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; color: #16a34a;">- ₱${parseFloat(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits:2})}</td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: bold;">₱${currentBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
          </tr>
      `;
    }

    tableHtml += `
        </tbody>
      </table>
    `;

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #fbcfe8; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #fbcfe8; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #FF4191; margin: 0;">ADC Gadgets</h1>
          <h2 style="color: #64748b; font-size: 16px; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Statement of Account</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap;">
          <div style="margin-bottom: 16px; margin-right: 20px;">
            <p style="margin: 4px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: bold;">Account Holder</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${loan.full_name || 'Customer'}</p>
            <p style="margin: 4px 0; font-size: 14px;">${loan.email}</p>
          </div>
          <div>
            <p style="margin: 4px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: bold;">Contract Details</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${loan.device_name}</p>
            <p style="margin: 4px 0; font-size: 14px;">Total SRP: ₱${parseFloat(loan.total_amount).toLocaleString('en-US', {minimumFractionDigits:2})}</p>
            <p style="margin: 0; font-size: 14px;">Status: <strong style="color: ${loan.status === 'completed' ? '#16a34a' : '#FF4191'}">${loan.status.toUpperCase()}</strong></p>
          </div>
        </div>

        <h3 style="margin-bottom: 8px; color: #333; font-size: 16px;">Transaction Ledger</h3>
        ${tableHtml}

        <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">Remaining Balance: <span style="color: #FF4191;">₱${parseFloat(loan.remaining_balance).toLocaleString('en-US', {minimumFractionDigits:2})}</span></p>
          ${loan.status !== 'completed' ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">Next Payment Due: ${new Date(loan.next_payment_date).toLocaleDateString()}</p>` : `<p style="margin: 8px 0 0 0; font-size: 14px; color: #16a34a; font-weight: bold;">Congratulations! This device is fully paid.</p>`}
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
          This is an official Statement of Account requested from your ADC Gadgets portal account.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ADC Gadgets" <${process.env.SMTP_FROM || 'no-reply@adcgadgets.com'}>`,
      to: loan.email,
      subject: `Statement of Account: ${loan.device_name} - ADC Gadgets`,
      html: htmlEmail
    });

    res.json({ success: true, message: 'Statement emailed successfully to your email.' });
  } catch (err) {
    console.error('Error emailing user statement:', err);
    res.status(500).json({ error: 'Failed to send email statement: ' + (err.message || 'Server error') });
  }
});

// ─── CRON JOB: PAYMENT REMINDERS ──────────────────────────────────────────────
app.get('/api/cron/due-reminders', async (req, res) => {
  try {
    // Look for active loans where next_payment_date is exactly 3 days from now
    // We use DATE() to compare just the date parts.
    const query = `
      SELECT l.*, p.email, p.full_name 
      FROM loans l
      JOIN profiles p ON l.user_id = p.id
      WHERE l.status = 'active' 
        AND DATE(l.next_payment_date) = DATE(NOW() + INTERVAL '3 days')
    `;
    const { rows } = await pool.query(query);

    let emailsSent = 0;

    for (const loan of rows) {
      if (!loan.email) continue;
      
      const dueDate = new Date(loan.next_payment_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
      const amount = parseFloat(loan.monthly_payment).toLocaleString('en-PH', { minimumFractionDigits: 2 });
      
      try {
        await transporter.sendMail({
          from: `"ADC Gadgets" <${process.env.SMTP_FROM || 'no-reply@adcgadgets.com'}>`,
          to: loan.email,
          subject: 'Payment Reminder - ADC Gadgets',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #FF4191;">Payment Reminder</h2>
              <p>Hi ${loan.full_name || 'Customer'},</p>
              <p>This is a friendly reminder from ADC Gadgets that your monthly installment for the <strong>${loan.device_name}</strong> is coming up soon.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Due Date</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${dueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Amount Due</td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: #FF4191; font-weight: bold;">₱${amount}</td>
                </tr>
              </table>
              <p>Please ensure your payment is made on or before the due date to keep your account in good standing.</p>
              <p>You can pay conveniently via GCash or Maya by logging into your account on the ADC Gadgets platform.</p>
              <br>
              <p>Thank you,<br><strong>The ADC Gadgets Team</strong></p>
            </div>
          `
        });
        emailsSent++;
      } catch (emailErr) {
        console.error("Failed to send reminder email to:", loan.email, emailErr.message);
      }
    }

    res.json({ success: true, processed: rows.length, emailsSent });
  } catch (err) {
    console.error('Error in /api/cron/due-reminders:', err);
    res.status(500).json({ error: 'Server error running cron job' });
  }
});

// ─── START SERVER ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;