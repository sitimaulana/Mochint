// 1. Data Produk (Diperbarui dengan detail lengkap untuk Page Detail)
export const mockProducts = [
  {
    id: 1,
    name: 'Pronafa Glowing Cream',
    category: 'Best Seller',
    price: '90.000',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
    is_recommended: true,
    weight: '10 gr',
    bpom: 'NA18210102762',
    // Deskripsi singkat untuk kartu produk
    description: 'Krim pelembab untuk hasil wajah glowing seketika.',
    // Deskripsi panjang sesuai gambar "Skincare Product Detail.jpg"
    longDescription: 'Pelembab Moisturizer Bpom Paling Ampuh Halal Mui merupakan cream pencerah yang diformulasikan untuk menjaga kelembapan alami kulit. Mengandung Amino Ceramide, Aloe Vera, dan Sodium Hyaluronate yang mempercepat pemulihan jaringan dan mencerahkan kulit agar tampak sehat merona.'
  },
  {
    id: 2,
    name: 'Acne Defense Night Cream',
    category: 'Acne',
    price: '110.000',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=500&q=80',
    is_recommended: true,
    weight: '12 gr',
    bpom: 'NA18210102763',
    description: 'Perawatan malam khusus untuk kulit berjerawat.',
    longDescription: 'Krim malam intensif yang bekerja melawan bakteri penyebab jerawat sekaligus menenangkan kemerahan selama Anda tidur.'
  },
  {
    id: 3,
    name: 'Brightening Serum C+',
    category: 'Brightening',
    price: '150.000',
    image: 'https://images.unsplash.com/photo-1556228720-1957be6d9776?auto=format&fit=crop&w=500&q=80',
    is_recommended: false,
    weight: '15 ml',
    bpom: 'NA18210102764',
    description: 'Serum pencerah dengan konsentrasi Vitamin C tinggi.',
    longDescription: 'Serum pencerah kategori cosmeceutical dengan efektivitas tinggi untuk menyamarkan noda hitam dan meratakan warna kulit.'
  },
  {
    id: 4,
    name: 'Ultimate Glowing Bundle',
    category: 'Bundling',
    price: '350.000',
    image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?auto=format&fit=crop&w=500&q=80',
    is_recommended: true,
    weight: ' Paket Lengkap',
    bpom: 'Tersertifikasi Paket',
    description: 'Paket lengkap untuk kulit sehat dan bercahaya.',
    longDescription: 'Rangkaian produk terbaik Mochint yang dikombinasikan untuk memberikan hasil maksimal bagi transformasi kulit Anda.'
  },
  {
    id: 5,
    name: 'Gentle Cleansing Foam',
    category: 'Best Seller',
    price: '85.000',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=500&q=80',
    is_recommended: true,
    weight: '100 ml',
    bpom: 'NA18210102765',
    description: 'Pembersih wajah lembut untuk semua jenis kulit.',
    longDescription: 'Pembersih wajah dengan pH seimbang yang membersihkan debu dan kotoran tanpa menghilangkan kelembapan alami kulit.'
  }
];

// 2. Data Appointment (Daftar booking yang akan datang)
export const mockAppointments = [
  {
    id: 'A001',
    userId: 'M0001',
    treatmentName: 'Facial Detox',
    date: 'Kamis, 1 Januari 2026',
    price: 'Rp.135.000',
    status: 'Pending',
  },
  {
    id: 'A002',
    userId: 'M0001',
    treatmentName: 'Facial Mesotherapy',
    date: 'Jumat, 2 Januari 2026',
    price: 'Rp.175.000',
    status: 'Confirmed',
  },
  {
    id: 'A003',
    userId: 'M0001',
    treatmentName: 'Facial Micro Diamond',
    date: 'Sabtu, 3 Januari 2026',
    price: 'Rp.120.000',
    status: 'Confirmed',
  }
];

// 3. Data History (Booking Selesai)
export const mockHistory = [
  {
    id: 'H001',
    userId: 'M0001',
    treatmentName: 'Facial Peeling Ultimate',
    date: 'Minggu, 21 Desember 2025',
    price: 'Rp.175.000',
    status: 'Completed'
  },
  {
    id: 'H002',
    userId: 'M0001',
    treatmentName: 'Mochint Signature',
    date: 'Senin, 15 Desember 2025',
    price: 'Rp.250.000',
    status: 'Completed'
  },
  {
    id: 'H003',
    userId: 'M0001',
    treatmentName: 'Facial Detox',
    date: 'Kamis, 11 Desember 2025',
    price: 'Rp.135.000',
    status: 'Completed'
  }
];

// 4. Data Testimoni
export const mockTestimonials = [
  {
    id: 1,
    name: 'Sarah Wijaya',
    location: 'Jakarta',
    rating: 5,
    comment: 'Treatment facial di Mochint benar-benar mengubah kulit saya. Hasilnya natural.'
  },
  {
    id: 2,
    name: 'Maya Ratnasari',
    location: 'Bandung',
    rating: 4.8,
    comment: 'Skincare produknya sangat cocok untuk kulit sensitif saya. Glowing bertahan lama!'
  },
  {
    id: 3,
    name: 'Rina Dewi',
    location: 'Surabaya',
    rating: 5,
    comment: 'Booking mudah melalui aplikasi member. Pelayanan sangat memuaskan.'
  }
];

// Tambahkan ini di src/api/mockData.js

export const mockTreatments = [
  {
    id: 1,
    name: 'Facial Micro Diamond',
    category: 'Beauty Treatment',
    price: '150.000',
    image: 'https://images.unsplash.com/photo-1570172619382-c1013d9c32c7?auto=format&fit=crop&w=500&q=80',
    description: 'Treatment pengangkatan sel kulit mati dengan teknologi micro-diamond untuk kulit lebih halus.'
  },
  {
    id: 2,
    name: 'Facial Detox Signature',
    category: 'Special Treatment',
    price: '200.000',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=500&q=80',
    description: 'Membersihkan racun dan polusi dari pori-pori wajah secara mendalam.'
  },
  {
    id: 3,
    name: 'Mochint Ultimate Glow',
    category: 'Ultimate Treatment',
    price: '450.000',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=500&q=80',
    description: 'Kombinasi treatment premium untuk hasil wajah cerah dan kenyal seketika.'
  }
];
// Tambahkan di src/api/mockData.js

export const mockInformation = [
  {
    id: 1,
    title: 'Mochint: Rahasia Kulit Glowing dengan Rutinitas Treatment yang Tepat',
    category: 'Headline',
    date: 'Februari 2026',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80',
    description: 'Banyak wanita mendambakan kulit sehat merona. Simak tips dari para ahli kecantikan di Mochint tentang pentingnya treatment rutin...'
  },
  {
    id: 2,
    title: 'Manfaat Facial Micro Diamond untuk Kesehatan Kulit Masa Depan',
    category: 'Trending',
    image: 'https://images.unsplash.com/photo-1570172619382-c1013d9c32c7?auto=format&fit=crop&w=500&q=80',
    description: 'Tak hanya membersihkan, inilah manfaat treatment rutin bagi kesehatan kulit masa depan.'
  },
  // Tambahkan beberapa item lagi untuk mengisi sidebar terpopuler
  { id: 3, title: 'Tips Menghindari Pori-pori Tersumbat pada Kulit Berminyak', category: 'Tips' },
  { id: 4, title: 'Promo Bundling Skincare Februari: Cek Sekarang!', category: 'News' },
];