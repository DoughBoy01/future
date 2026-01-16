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
          600: '#fe4d39',
          700: '#b13527',
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
        // Semantic Trust Colors
        'trust-success': {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        'trust-verified': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        'trust-elite': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
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
      // Animations for chat messages
      keyframes: {
        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0) scale(1)',
          },
        },
        'slide-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0) scale(1)',
          },
        },
        'typing-bounce': {
          '0%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(254, 77, 57, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(254, 77, 57, 0.6)',
          },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'typing-bounce': 'typing-bounce 1.4s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
