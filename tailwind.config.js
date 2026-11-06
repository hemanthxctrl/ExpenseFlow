/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060913',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#131C31',
          750: '#17223C',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        income: {
          light: '#ECFDF5',
          DEFAULT: '#10B981',
          dark: '#059669',
          hover: '#047857'
        },
        expense: {
          light: '#FFF1F2',
          DEFAULT: '#F43F5E',
          dark: '#E11D48',
          hover: '#BE123C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'glow-income': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'glow-expense': '0 0 20px -5px rgba(244, 63, 94, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

