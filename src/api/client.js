import { mockProducts, mockTestimonials } from './mockData';

// --- 1. HOME & PRODUCT DATA ---
export const fetchHomeData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recommended = mockProducts.filter(item => item.is_recommended === true);
      
      // MENGAMBIL REVIEW DARI LOCAL STORAGE (JIKA ADA)
      const savedReviews = JSON.parse(localStorage.getItem('public_reviews')) || [];
      
      resolve({
        products: recommended.slice(0, 4),
        // Gabungkan review member (terbaru) dengan review mock (default)
        testimonials: [...savedReviews, ...mockTestimonials]
      });
    }, 500);
  });
};

// --- 2. REVIEW SYSTEM (DIPERBAIKI) ---
export const postReview = (newReviewData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Ambil data review lama dari localStorage
      const existingReviews = JSON.parse(localStorage.getItem('public_reviews')) || [];

      // 2. Buat objek review baru yang lengkap
      const savedReview = {
        id: Date.now(),
        ...newReviewData,
        // Alamat diambil dari data yang dikirim Dashboard, jika kosong pakai default
        location: newReviewData.location || 'Verified Member', 
        date: new Date().toLocaleDateString('id-ID')
      };

      // 3. Masukkan ke urutan paling atas
      const updatedReviews = [savedReview, ...existingReviews];

      // 4. Simpan kembali secara permanen ke browser
      localStorage.setItem('public_reviews', JSON.stringify(updatedReviews));

      resolve(savedReview);
    }, 800);
  });
};

// --- 3. AUTH SYSTEM (TETAP SAMA) ---
export const authAPI = {
  register: (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('mochint_users')) || [];
        const nextNumber = existingUsers.length + 1;
        const autoID = `M${nextNumber.toString().padStart(4, '0')}`;

        const newUser = { 
          ...userData, 
          id: autoID, 
          role: 'member',
          joinDate: new Date().toLocaleDateString('id-ID')
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('mochint_users', JSON.stringify(existingUsers));
        resolve({ success: true, user: newUser });
      }, 1000);
    });
  },

  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('mochint_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
          localStorage.setItem('active_user', JSON.stringify(user));
          resolve({ success: true, user });
        } else {
          reject({ message: "Email atau Password salah!" });
        }
      }, 1000);
    });
  },

  logout: () => {
    localStorage.removeItem('active_user');
  }
};