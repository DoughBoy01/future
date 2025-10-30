/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Airbnb Color Palette
      colors: {
        // Primary Pink Palette
        'airbnb-pink': {
          50: '#FFE8EA',
          100: '#FFE8EA',
          200: '#FFD1D6',
          300: '#FFC4CC',
          400: '#FF7B8F',
          500: '#FF385C',
          600: '#E31C5F',
          700: '#C71742',
          800: '#AB1236',
          900: '#8F0E2B',
        },
        // Neutral Greys
        'airbnb-grey': {
          50: '#F7F7F7',
          100: '#F7F7F7',
          200: '#EBEBEB',
          300: '#DDDDDD',
          400: '#B0B0B0',
          500: '#717171',
          600: '#5A5A5A',
          700: '#484848',
          800: '#353535',
          900: '#222222',
        },
      },
      // Typography
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h2': ['26px', { lineHeight: '32px', fontWeight: '500' }],
        'h3': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      fontWeight: {
        'book': '400',
        'medium': '500',
        'bold': '700',
      },
      // Spacing - 8px Base Grid
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '40px',
        '8': '48px',
        '9': '64px',
        '10': '80px',
      },
      // Border Radius
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '12px',
        '2xl': '12px',
        'full': '9999px',
      },
      // Shadows
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'xl': '0 6px 20px rgba(0, 0, 0, 0.15)',
        '2xl': '0 6px 20px rgba(0, 0, 0, 0.15)',
      },
      // Max Width
      maxWidth: {
        'content': '1120px',
      },
      // Transitions
      transitionTimingFunction: {
        'airbnb': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '200ms',
        'standard': '300ms',
        'slow': '500ms',
      },
    },
  },
  plugins: [],
};
