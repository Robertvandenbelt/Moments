import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // M3 Color System - Baseline
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50', // Primary base
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
          DEFAULT: '#4CAF50',
          container: '#E8F5E9',
          action: '#2E7D32',
        },
        secondary: {
          50: '#E0F2F1',
          100: '#B2DFDB',
          200: '#80CBC4',
          300: '#4DB6AC',
          400: '#26A69A',
          500: '#009688', // Secondary base
          600: '#00897B',
          700: '#00796B',
          800: '#00695C',
          900: '#004D40',
          DEFAULT: '#009688',
          container: '#E0F2F1',
        },
        tertiary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3', // Tertiary base
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          DEFAULT: '#2196F3',
          container: '#E3F2FD',
        },
        error: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#F44336', // Error base
          600: '#E53935',
          700: '#D32F2F',
          800: '#C62828',
          900: '#B71C1C',
          DEFAULT: '#F44336',
          container: '#FFEBEE',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dim: '#F5F5F5',
          bright: '#FAFAFA',
          container: {
            lowest: '#FFFFFF',
            low: '#F5F5F5',
            DEFAULT: '#EEEEEE',
            high: '#E0E0E0',
            highest: '#BDBDBD',
          }
        },
        outline: {
          DEFAULT: '#9E9E9E',
          variant: '#E0E0E0',
        },
        // Text colors for "on-" states
        'on-primary': '#FFFFFF',
        'on-primary-container': '#1B5E20',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#004D40',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#0D47A1',
        'on-error': '#FFFFFF',
        'on-error-container': '#B71C1C',
        'on-surface': '#212121',
        'on-surface-variant': '#757575',
        // Neutral colors for surface and background
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          DEFAULT: '#9E9E9E',
        },
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
    },
  },
  plugins: [],
};
