import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Save,
  AlertCircle,
  Check,
  Map,
  Building2
} from '/src/components/icons';
import Preloader from '../../components/common/Preloader';

const Contact = () => {
  const [contactData, setContactData] = useState({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

  const API_URL = '/api/contact';

  useEffect(() => {
    fetchContactData();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.data) {
        setContactData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching contact data:', err);
      showNotification('Gagal Memuat', 'Gagal memuat data kontak', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, message, type) => {
    setNotification({ show: true, type, title, message });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setContactData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleOperatingHoursChange = (day, value) => {
    setContactData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactData.email && !contactData.phone) {
      showNotification('Validasi Gagal', 'Email atau nomor telepon harus diisi', 'error');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(API_URL, contactData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setContactData(response.data.data);
      showNotification('Berhasil!', 'Informasi kontak berhasil diperbarui', 'success');
    } catch (err) {
      console.error('Error saving contact data:', err);
      showNotification('Gagal Menyimpan', err.response?.data?.error || 'Gagal menyimpan data kontak', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Preloader type="fullscreen" text="Memuat data kontak..." bgColor="bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6 lg:p-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-start gap-3 px-6 py-4 rounded-lg shadow-2xl min-w-[300px] ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
          Informasi Kontak
        </h1>
        <p className="text-[#6D4C41]">
          Kelola informasi kontak klinik seperti nomor telepon, email, alamat, dan sosial media
        </p>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2 mb-4">
              <Phone className="w-6 h-6" />
              Kontak Dasar
            </h2>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="tel"
                  name="phone"
                  value={contactData.phone}
                  onChange={handleInputChange}
                  placeholder="Contoh: 021-12345678"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="tel"
                  name="whatsapp"
                  value={contactData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Contoh: 628123456789"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-[#8D6E63] mt-1">Format: 628xxx (tanpa +)</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: info@klinik.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6" />
              Alamat
            </h2>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Alamat Lengkap
              </label>
              <textarea
                name="address"
                value={contactData.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Jalan, nomor, kelurahan, kecamatan"
                className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* City & Province */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                  Kota
                </label>
                <input
                  type="text"
                  name="city"
                  value={contactData.city}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jakarta"
                  className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="province"
                  value={contactData.province}
                  onChange={handleInputChange}
                  placeholder="Contoh: DKI Jakarta"
                  className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                name="postal_code"
                value={contactData.postal_code}
                onChange={handleInputChange}
                placeholder="Contoh: 12345"
                className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
              />
            </div>

            {/* Maps URL */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Google Maps URL
              </label>
              <div className="relative">
                <Map className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="url"
                  name="maps_url"
                  value={contactData.maps_url}
                  onChange={handleInputChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2 mb-4">
              <Instagram className="w-6 h-6" />
              Media Sosial
            </h2>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Instagram
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="text"
                  value={contactData.social_media?.instagram || ''}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="@username atau URL lengkap"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Facebook
              </label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="text"
                  value={contactData.social_media?.facebook || ''}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="Facebook page URL"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Twitter / X
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="text"
                  value={contactData.social_media?.twitter || ''}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="@username atau URL lengkap"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                TikTok
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-[#8D6E63]" />
                <input
                  type="text"
                  value={contactData.social_media?.tiktok || ''}
                  onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                  placeholder="@username atau URL lengkap"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Jam Operasional
            </h2>

            {/* Weekday */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Senin - Jumat
              </label>
              <input
                type="text"
                value={contactData.operating_hours?.weekday || ''}
                onChange={(e) => handleOperatingHoursChange('weekday', e.target.value)}
                placeholder="Contoh: 09:00 - 21:00 WIB"
                className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
              />
            </div>

            {/* Weekend */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                Sabtu - Minggu
              </label>
              <input
                type="text"
                value={contactData.operating_hours?.weekend || ''}
                onChange={(e) => handleOperatingHoursChange('weekend', e.target.value)}
                placeholder="Contoh: 10:00 - 18:00 WIB"
                className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
              />
            </div>

            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#D7CCC8]">
              <p className="text-sm text-[#6D4C41]">
                💡 <strong>Tips:</strong> Informasi yang diisi di sini akan ditampilkan di halaman kontak website dan dapat diakses oleh pengunjung.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#3E2723] to-[#8D6E63] hover:from-[#8D6E63] hover:to-[#3E2723]'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;


