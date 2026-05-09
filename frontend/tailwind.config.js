/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF2EF',
          100: '#FFDBB6',
          500: '#7A86A8',
          600: '#5D688A',
          900: '#35405F',
        },
        accent: {
          50: '#FFF2EF',
          100: '#FFD8D8',
          500: '#F7A5A5',
          600: '#E78383',
        }
      },
      boxShadow: {
        'glass': '0 18px 45px rgba(93, 104, 138, 0.12)',
        'soft': '0 12px 30px rgba(247, 165, 165, 0.18)',
      }
    },
  },
  plugins: [],
}
