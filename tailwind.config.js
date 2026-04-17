/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        skopyr: {
          bg: '#09090B',
          card: 'rgba(255,255,255,0.028)',
          'card-hover': 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.06)',
          accent: '#FF6B2B',
          'accent-dim': 'rgba(255,107,43,0.12)',
          'accent-border': 'rgba(255,107,43,0.25)',
          success: '#22C55E',
          warning: '#F59E0B',
          text1: '#FAFAFA',
          text2: 'rgba(255,255,255,0.55)',
          text3: 'rgba(255,255,255,0.3)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-2.5px',
        tight: '-1.5px',
        snug: '-0.5px',
        wide: '3px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-dot': 'pulse 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
