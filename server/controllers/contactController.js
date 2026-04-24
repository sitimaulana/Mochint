const Contact = require('../models/Contact');

class ContactController {
  // Get contact information
  async get(req, res) {
    try {
      const contact = await Contact.get();
      
      if (!contact) {
        // Initialize if not exists
        await Contact.initialize();
        const newContact = await Contact.get();
        return res.status(200).json({
          success: true,
          data: newContact
        });
      }
      
      res.status(200).json({
        success: true,
        data: contact
      });
    } catch (error) {
      console.error('Error in get:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal mengambil data kontak',
        details: error.message
      });
    }
  }

  // Update contact information
  async update(req, res) {
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
      } = req.body;

      const updatedContact = await Contact.createOrUpdate({
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
      });

      res.status(200).json({
        success: true,
        message: 'Informasi kontak berhasil diperbarui',
        data: updatedContact
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal memperbarui data kontak',
        details: error.message
      });
    }
  }
}

module.exports = new ContactController();
