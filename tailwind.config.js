/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Teks utama menggunakan Inter
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        // Judul/Display menggunakan Poppins (Pastikan Poppins sudah diimport di index.css)
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        }
      }
    },
  },
  plugins: [],
}