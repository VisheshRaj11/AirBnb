/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0F0F0F',
          surface: '#1A1A1A',
          'surface-hover': '#232323',
        },
        border: {
          DEFAULT: '#2E2E2E',
          muted: '#252525',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A8A8A8',
          muted: '#767676',
        },
        brand: {
          DEFAULT: '#FF385C',
          hover: '#E31C5F',
        },
        success: '#34C759',
        star: '#FFD24C',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'dark-soft': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'dark-elevated': '0 20px 40px rgba(0, 0, 0, 0.65)',
        'brand-glow': '0 4px 20px rgba(255, 56, 92, 0.35)',
      },
    },
  },
  plugins: [],
}
