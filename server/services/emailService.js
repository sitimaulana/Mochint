const nodemailer = require('nodemailer');

/**
 * Email Service untuk mengirim email menggunakan Nodemailer
 * Mendukung Gmail dan SMTP lainnya
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter dengan konfigurasi dari environment variables
   */
  async initialize() {
    try {
      // Validasi konfigurasi
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️ Email service not configured. Using development mode (OTP in console).');
        this.initialized = false;
        return false;
      }

      const emailConfig = {
        host: 'smtp.gmail.com', // Explicit host untuk Gmail
        port: 465, // Port SSL
        secure: true, // true untuk port 465 (SSL)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // App Password for Gmail
        },
        // Force IPv4 untuk menghindari error ENETUNREACH dengan IPv6
        family: 4,
        // TLS configuration
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2',
          ciphers: 'SSLv3'
        },
        // Connection settings - Timeout lebih panjang
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 10000,
        socketTimeout: 30000,
        // Debug output
        debug: false,
        logger: false
      };

      // Jika menggunakan service lain (Outlook, Yahoo, dll)
      if (process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE !== 'gmail') {
        emailConfig.service = process.env.EMAIL_SERVICE;
        delete emailConfig.host;
        delete emailConfig.port;
      }

      this.transporter = nodemailer.createTransport(emailConfig);

      // SKIP verify saat startup untuk menghindari blocking
      // Verify akan dilakukan saat kirim email pertama kali (lazy verification)
      console.log('📧 Email service configured (will verify on first send)');
      console.log(`   Set di .env: ${process.env.EMAIL_USER}`);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('💡 Tip: Pastikan App Password Gmail sudah benar dan 2FA sudah aktif');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Kirim email OTP untuk verifikasi
   * @param {string} email - Email tujuan
   * @param {string} otp - Kode OTP 6 digit
   * @param {string} name - Nama penerima (optional)
   */
  async sendOTPEmail(email, otp, name = 'Member') {
    if (!this.initialized) {
      console.log('📧 Email service not active. OTP Code:', otp);
      return { success: true, message: 'Development mode - OTP logged to console', devMode: true };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Mochint Beauty Clinic',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Kode Verifikasi OTP - Mochint Beauty Clinic',
        html: this.getOTPEmailTemplate(otp, name)
      };

      console.log('📤 Sending email to:', email);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      
      return { 
        success: true, 
        message: 'Email sent successfully',
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      
      // Diagnostic information
      if (error.code === 'EAUTH') {
        console.log('💡 Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD in .env');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        console.log('💡 Connection timeout. Possible causes:');
        console.log('   - Firewall/Antivirus blocking SMTP port 465');
        console.log('   - ISP blocking SMTP connections');
        console.log('   - Network connectivity issues');
      }
      
      // Return error but don't crash - let it fallback to console mode
      throw new Error(`Gagal mengirim email: ${error.message}`);
    }
  }

  /**
   * HTML Template untuk email OTP
   */
  getOTPEmailTemplate(otp, name) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #FDFBF7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFBF7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Mochint Beauty Clinic</h1>
              <p style="color: #EFEBE9; margin: 10px 0 0 0; font-size: 14px;">Your Beauty, Our Priority</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #3E2723; margin: 0 0 20px 0; font-size: 24px;">Halo, ${name}!</h2>
              <p style="color: #5D4037; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Terima kasih telah menggunakan layanan Mochint Beauty Clinic. Berikut adalah kode verifikasi OTP Anda:
              </p>
              
              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px; background-color: #FDFBF7; border-radius: 15px; border: 3px dashed #8D6E63;">
                    <div style="font-size: 42px; font-weight: bold; color: #3E2723; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #8D6E63; font-size: 14px; text-align: center; margin: 20px 0 30px 0;">
                 Kode ini berlaku selama <strong>5 menit</strong>
              </p>
              
              <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #E65100; font-size: 13px; margin: 0; line-height: 1.5;">
                  <strong> Peringatan Keamanan:</strong><br>
                  Jangan bagikan kode ini kepada siapapun, termasuk staff Mochint. Kami tidak akan pernah meminta kode OTP Anda melalui telepon atau email.
                </p>
              </div>
              
              <p style="color: #757575; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0;">
                Jika Anda tidak melakukan permintaan ini, abaikan email ini dan akun Anda tetap aman.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F5; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="color: #757575; font-size: 12px; margin: 0 0 10px 0;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
              <p style="color: #757575; font-size: 12px; margin: 0;">
                &copy; 2026 Mochint Beauty Clinic. All rights reserved.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Website</a>
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Instagram</a>
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Contact</a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Kirim email reset password confirmation
   */
  async sendPasswordResetConfirmation(email, name = 'Member') {
    if (!this.initialized) {
      console.log('Email service not active. Password reset confirmation not sent.');
      return { success: true, devMode: true };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Mochint Beauty Clinic',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Password Berhasil Direset - Mochint Beauty Clinic',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #FDFBF7; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 20px; padding: 40px;">
    <h2 style="color: #3E2723;">Password Berhasil Direset</h2>
    <p style="color: #5D4037;">Halo, ${name}!</p>
    <p style="color: #5D4037;">Password Anda telah berhasil direset. Anda sekarang dapat login menggunakan password baru Anda.</p>
    <p style="color: #8D6E63; font-size: 14px; margin-top: 30px;">Jika Anda tidak melakukan reset password, segera hubungi kami.</p>
    <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
    <p style="color: #757575; font-size: 12px;">© 2026 Mochint Beauty Clinic</p>
  </div>
</body>
</html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset confirmation sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      // Don't throw error for confirmation emails
      return { success: false };
    }
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (!this.initialized) {
        return { success: false, message: 'Email service not configured' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Email connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;
