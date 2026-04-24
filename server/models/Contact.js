const { promisePool } = require('../config/database');

class Contact {
  // Get contact information
  static async get() {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM contact_information LIMIT 1'
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        ...row,
        social_media: row.social_media ? 
          (typeof row.social_media === 'string' ? JSON.parse(row.social_media) : row.social_media) 
          : null,
        operating_hours: row.operating_hours ?
          (typeof row.operating_hours === 'string' ? JSON.parse(row.operating_hours) : row.operating_hours)
          : null
      };
    } catch (error) {
      console.error('Error in Contact.get:', error);
      throw error;
    }
  }

  // Create or update contact information
  static async createOrUpdate(data) {
    try {
      const {
        phone,
        whatsapp,
        email,
        address,
        city,
        province,
        postal_code,
        maps_url,
        social_media,
        operating_hours
      } = data;

      const socialMediaJson = social_media ? JSON.stringify(social_media) : null;
      const operatingHoursJson = operating_hours ? JSON.stringify(operating_hours) : null;

      // Check if contact exists
      const existing = await this.get();

      if (existing) {
        // Update existing
        await promisePool.query(
          `UPDATE contact_information 
          SET phone = ?, whatsapp = ?, email = ?, address = ?, city = ?, 
              province = ?, postal_code = ?, maps_url = ?, social_media = ?, 
              operating_hours = ?, updated_at = NOW()
          WHERE id = ?`,
          [phone, whatsapp, email, address, city, province, postal_code, maps_url, 
           socialMediaJson, operatingHoursJson, existing.id]
        );
      } else {
        // Create new
        await promisePool.query(
          `INSERT INTO contact_information 
          (phone, whatsapp, email, address, city, province, postal_code, maps_url, 
           social_media, operating_hours) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [phone, whatsapp, email, address, city, province, postal_code, maps_url, 
           socialMediaJson, operatingHoursJson]
        );
      }

      return this.get();
    } catch (error) {
      console.error('Error in Contact.createOrUpdate:', error);
      throw error;
    }
  }

  // Initialize default contact if not exists
  static async initialize() {
    try {
      const existing = await this.get();
      if (!existing) {
        await this.createOrUpdate({
          phone: '',
          whatsapp: '',
          email: '',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          maps_url: '',
          social_media: {
            instagram: '',
            facebook: '',
            twitter: '',
            tiktok: ''
          },
          operating_hours: {
            weekday: '',
            weekend: ''
          }
        });
      }
    } catch (error) {
      console.error('Error in Contact.initialize:', error);
      throw error;
    }
  }
}

module.exports = Contact;
