const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/Admin');
const memberModel = require('../models/Member');

const normalizeRow = (res) => {
  if (!res) return null;
  if (Array.isArray(res)) return res[0] || null;
  // If model returns object or class instance
  return res;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const normalizedEmail = email.toLowerCase().trim();

    // Try admin first
    const adminRes = await adminModel.findByEmail(normalizedEmail);
    const admin = normalizeRow(adminRes);

    if (admin && admin.password) {
      const validPass = await bcrypt.compare(password, admin.password);
      if (!validPass) return res.status(400).json({ success: false, error: 'Invalid password' });

      const token = jwt.sign(
        { id: admin.id, email: admin.email, user_type: 'admin', role: admin.role || 'admin' },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );

      const user = {
        id: admin.id,
        username: admin.username || admin.email,
        email: admin.email,
        full_name: admin.full_name || null,
        role: admin.role || 'admin',
        user_type: 'admin'
      };

      return res.json({ success: true, token, user });
    }

    // Try member
    const memberRes = await memberModel.findByEmail(normalizedEmail);
    const member = normalizeRow(memberRes);

    if (member && member.password) {
      const validPass = await bcrypt.compare(password, member.password);
      if (!validPass) return res.status(400).json({ success: false, error: 'Invalid password' });

      const token = jwt.sign(
        { id: member.id, email: member.email, user_type: 'member' },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );

      const user = {
        id: member.id,
        name: member.name || member.email,
        email: member.email,
        user_type: 'member'
      };

      return res.json({ success: true, token, user });
    }

    return res.status(404).json({ success: false, error: 'User not found' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password minimal 6 karakter' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Cek email sudah ada (normalize hasil)
    const existingMemberRes = await memberModel.findByEmail(normalizedEmail);
    const existingMember = normalizeRow(existingMemberRes);
    if (existingMember) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar' });
    }

    const existingAdminRes = await adminModel.findByEmail(normalizedEmail);
    const existingAdmin = normalizeRow(existingAdminRes);
    if (existingAdmin) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar' });
    }

    // Buat member baru
    const newMember = await memberModel.create({
      name,
      email: normalizedEmail,
      phone,
      address,
      password
    });

    // Ensure returned object contains id/email/name
    const created = normalizeRow(newMember) || newMember;

    const token = jwt.sign(
      { id: created.id, email: created.email || normalizedEmail, user_type: 'member' },
      process.env.JWT_SECRET || 'mochint_secret_key',
      { expiresIn: '24h' }
    );

    const user = {
      id: created.id,
      name: created.name || name,
      email: created.email || normalizedEmail,
      user_type: 'member'
    };

    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.redirect('http://localhost:5173/login?error=google_auth_failed');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: 'member' },
      process.env.JWT_SECRET || 'mochint_secret_key',
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      user_type: 'member',
      google_id: user.google_id || null,
      profile_picture: user.profile_picture || null
    };

    // Redirect ke frontend dengan token di URL
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('http://localhost:5173/auth/login?error=server_error');
  }
};

module.exports = { login, register, googleCallback };