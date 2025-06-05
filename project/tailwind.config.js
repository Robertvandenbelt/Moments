import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // M3 Color System
        primary: {
          DEFAULT: '#E27D60', // Primary - coral pink
          container: '#DCE9D7', // Minty pastel for secondary button
          action: '#5A7742', // Leafy green for primary actions
        },
        secondary: {
          DEFAULT: '#FFF7ED', // Orange-50 for backgrounds
          container: '#DCE9D7', // Minty pastel
        },
        tertiary: {
          DEFAULT: '#3D6374',
          container: '#C1E8FF',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        surface: {
          DEFAULT: '#FCFDF7',
          dim: '#DCE5DE',
          bright: '#F8FAF6',
          container: {
            lowest: '#FFFFFF',
            low: '#F6F9F6',
            DEFAULT: '#F0F4F1',
            high: '#EBF3ED',
            highest: '#E6EDE7',
          }
        },
        outline: {
          DEFAULT: '#70796F',
          variant: '#C1C9C0',
        },
        // Text colors for "on-" states
        'on-primary': '#FFFFFF',
        'on-primary-container': '#002117',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#072019',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#001F2A',
        'on-error': '#FFFFFF',
        'on-error-container': '#410002',
        'on-surface': '#191C1A',
        'on-surface-variant': '#404943',
        orange: {
          ...colors.orange,
          50: '#FFF7ED', // Explicitly set orange-50
          DEFAULT: '#F97316',
          500: '#F97316',
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
      // M3 Typography
      fontFamily: {
        sans: ['"Roboto Flex Variable"', 'Inter', 'system-ui', 'sans-serif'],
        'roboto-flex': ['"Roboto Flex Variable"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px' }],
        'display-small': ['36px', { lineHeight: '44px' }],
        // Headline
        'headline-large': ['32px', { lineHeight: '40px' }],
        'headline-medium': ['28px', { lineHeight: '36px' }],
        'headline-small': ['24px', { lineHeight: '32px' }],
        // Title
        'title-large': ['22px', { lineHeight: '28px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        // Label
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        // Body
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
      },
      // M3 Shape
      borderRadius: {
        'none': '0px',
        'extra-small': '4px',
        'small': '8px',
        'medium': '12px',
        'large': '16px',
        'extra-large': '28px',
        'full': '9999px',
      },
      // M3 Elevation
      boxShadow: {
        'level1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'level2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'level3': '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'level4': '0px 2px 3px 0px rgba(0, 0, 0, 0.30), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'level5': '0px 4px 4px 0px rgba(0, 0, 0, 0.30), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out'
      },
      textShadow: {
        'stroke-primary': '-1px -1px 0 var(--primary), 1px -1px 0 var(--primary), -1px 1px 0 var(--primary), 1px 1px 0 var(--primary)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.text-stroke-primary': {
          '-webkit-text-stroke': '2px var(--primary)',
          'text-stroke': '2px var(--primary)',
          'paint-order': 'stroke fill',
        },
      });
    },
  ],
};
