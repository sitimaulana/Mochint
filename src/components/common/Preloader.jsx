import React from 'react';
import { Loader } from '/src/components/icons';

/**
 * Preloader Component - Unified loading indicator untuk seluruh aplikasi
 * 
 * @param {string} type - Tipe preloader: 'fullscreen', 'partial', atau 'inline' (default: 'fullscreen')
 * @param {string} text - Teks loading yang ditampilkan (optional)
 * @param {string} bgColor - Warna background (default: tergantung type)
 * @param {string} iconColor - Warna icon (default: '#8D6E63')
 * @param {number} iconSize - Ukuran icon (default: 48 untuk fullscreen, 32 untuk partial, 24 untuk inline)
 * 
 * @example
 * // Full screen preloader
 * <Preloader type="fullscreen" text="Mempersiapkan Layanan Terbaik..." />
 * 
 * // Partial preloader (tengah halaman)
 * <Preloader type="partial" text="Memuat data..." />
 * 
 * // Inline preloader (kecil)
 * <Preloader type="inline" />
 */
const Preloader = ({ 
  type = 'fullscreen', 
  text = '',
  bgColor = null,
  iconColor = '#8D6E63',
  iconSize = null
}) => {
  // Default configurations
  const configs = {
    fullscreen: {
      container: 'min-h-screen flex items-center justify-center',
      defaultBg: 'bg-white',
      innerBox: 'text-center',
      iconSize: iconSize || 48,
      textClass: 'mt-4 font-bold text-[#8D6E63] text-lg'
    },
    partial: {
      container: 'flex justify-center items-center h-64',
      defaultBg: 'bg-transparent',
      innerBox: 'text-center',
      iconSize: iconSize || 32,
      textClass: 'mt-3 text-gray-600 font-semibold text-base'
    },
    inline: {
      container: 'inline-flex items-center justify-center',
      defaultBg: 'bg-transparent',
      innerBox: 'flex items-center gap-2',
      iconSize: iconSize || 24,
      textClass: 'text-gray-600 font-medium text-sm'
    }
  };

  const config = configs[type] || configs.fullscreen;
  const background = bgColor || config.defaultBg;

  return (
    <div className={`${config.container} ${background}`}>
      <div className={config.innerBox}>
        <div className="animate-spin" style={{ color: iconColor }}>
          <Loader size={config.iconSize} />
        </div>
        {text && <p className={config.textClass}>{text}</p>}
      </div>
    </div>
  );
};

export default Preloader;

