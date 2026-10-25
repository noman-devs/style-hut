/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#D6336C',
          rose: '#A61E4D',
          ivory: '#FFF9F2',
          softPink: '#FCE7EF',
          gold: '#C9A34E',
          goldHover: '#B28F3F',
          dark: '#33242A',
          charcoal: '#1F1418',
          muted: '#7A6B72',
          border: '#F1DCE4',
          bg: '#FDF8F9',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(214, 51, 108, 0.08), 0 2px 6px -1px rgba(51, 36, 42, 0.04)',
        'card': '0 6px 24px -4px rgba(51, 36, 42, 0.07)',
        'elevated': '0 12px 36px -6px rgba(166, 30, 77, 0.12)',
      }
    },
  },
  plugins: [],
}
