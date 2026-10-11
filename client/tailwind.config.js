/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          saffron: '#FF9933',
          navy: '#002B49',
          deepBlue: '#0A192F',
          ashoka: '#000080',
          green: '#138808',
          slate: '#1E293B',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        indic: ['Hind', 'Noto Sans Devanagari', 'sans-serif']
      }
    },
  },
  plugins: [],
}
