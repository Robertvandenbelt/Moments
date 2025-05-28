import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          ...colors.orange,
          DEFAULT: '#F97316', // for bg-orange
          500: '#F97316',     // override exact orange-500
        },
        teal: {
          ...colors.teal,
          DEFAULT: '#38B2AC',
          500: '#38B2AC',
        },
        lime: {
          ...colors.lime,
          200: '#D9F99D',
        },
        gray: {
          ...colors.gray,
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          500: '#6B7280',
        },
        whatsapp: {
          light: '#e8ffd7',  // WhatsApp message background
          DEFAULT: '#25D366', // WhatsApp brand color
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0, 0, 0, 0.08)',
        fab: '0 4px 12px rgba(56, 178, 172, 0.5)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out'
      }
    },
  },
  plugins: [],
};
