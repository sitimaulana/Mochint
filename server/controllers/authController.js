const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/Admin');
const memberModel = require('../models/Member');
const emailService = require('../services/emailService');

// In-memory storage untuk OTP (dalam production, gunakan Redis atau database)
const otpStorage = new Map();

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
      return res.redirect('http://103.185.38.61/login?error=google_auth_failed');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: 'member' },
      process.env.JWT_SECRET || 'mochint_secret_key',
      { expiresIn: '24h' }
    );

    // Check if user needs to set password (password is null)
    const needsPassword = !user.password || user.password === null;

    const userData = {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      user_type: 'member',
      google_id: user.google_id || null,
      profile_picture: user.profile_picture || null,
      needsPassword: needsPassword // Flag untuk frontend
    };

    console.log(`🔐 Google OAuth - User ${user.email}, needsPassword: ${needsPassword}`);

    // Redirect ke frontend dengan token di URL
    res.redirect(`http://103.185.38.61/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('http://103.185.38.61/auth/login?error=server_error');
  }
};

// Send OTP to email
const sendOTP = async (req, res) => {
  try {
    console.log('📨 Received OTP request:', req.body);
    const { email, name } = req.body;

    if (!email) {
      console.log('⚠️ No email provided');
      return res.status(400).json({ success: false, message: 'Email diperlukan' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    const normalizedEmail = email.toLowerCase().trim();
    
    otpStorage.set(normalizedEmail, {
      otp,
      expiryTime,
      verified: false
    });

    console.log('✅ OTP stored for:', normalizedEmail);

    // Send OTP via email service
    try {
      const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp, name || 'Member');
      
      // Clean up expired OTPs periodically
      cleanupExpiredOTPs();

      // Response berdasarkan mode
      if (emailResult.devMode) {
        // Development mode - email service tidak aktif
        console.log('=================================');
        console.log('📧 OTP EMAIL VERIFICATION (DEV MODE)');
        console.log('=================================');
        console.log(`To: ${email}`);
        console.log(`Name: ${name || 'Member'}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 5 minutes`);
        console.log('=================================');
        
        return res.json({ 
          success: true, 
          message: 'Kode OTP berhasil dikirim (Dev Mode)',
          otp: otp, // Return OTP in development mode for easy testing
          devOTP: otp,
          devMode: true
        });
      } else {
        // Production mode - email terkirim
        console.log(`✅ OTP email sent successfully to: ${normalizedEmail}`);
        
        return res.json({ 
          success: true, 
          message: 'Kode OTP berhasil dikirim ke email Anda',
          // Jangan return OTP di production mode untuk keamanan
          ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      
      // Fallback ke console log jika email gagal
      console.log('=================================');
      console.log('📧 OTP EMAIL (FALLBACK TO CONSOLE)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('=================================');
      
      return res.json({ 
        success: true, 
        message: 'Kode OTP tersimpan (Email service error, check console)',
        otp: otp,
        devOTP: otp,
        warning: 'Email service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email dan OTP diperlukan' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedData = otpStorage.get(normalizedEmail);

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'OTP tidak ditemukan atau sudah kadaluarsa' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiryTime) {
      otpStorage.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'OTP sudah kadaluarsa' });
    }

    // Check if OTP matches
    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStorage.set(normalizedEmail, storedData);

    return res.json({ 
      success: true, 
      message: 'Email berhasil diverifikasi' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP' });
  }
};

// Set password for Google OAuth users
const setPassword = async (req, res) => {
  try {
    const { email, password, userId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password diperlukan' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if OTP was verified
    const storedData = otpStorage.get(normalizedEmail);
    if (!storedData || !storedData.verified) {
      return res.status(400).json({ success: false, message: 'Email belum diverifikasi' });
    }

    // Find member by email
    const memberRes = await memberModel.findByEmail(normalizedEmail);
    const member = normalizeRow(memberRes);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member tidak ditemukan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update member password
    await memberModel.updatePassword(member.id, hashedPassword);

    // Clean up OTP storage
    otpStorage.delete(normalizedEmail);

    console.log(`✅ Password set successfully for user: ${normalizedEmail}`);

    return res.json({ 
      success: true, 
      message: 'Password berhasil dibuat' 
    });
  } catch (error) {
    console.error('Set password error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat password' });
  }
};

// Helper function to clean up expired OTPs
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiryTime) {
      otpStorage.delete(email);
    }
  }
};

module.exports = { login, register, googleCallback, sendOTP, verifyOTP, setPassword };