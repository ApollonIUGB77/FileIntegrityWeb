/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:      '#080c0a',
          surface: '#0e1410',
          card:    '#111a13',
          border:  '#1a2e1d',
          green:   '#00ff41',
          dim:     '#00cc33',
          blue:    '#00b4d8',
          red:     '#ff4444',
          yellow:  '#ffd60a',
          text:    '#c8d8c8',
          muted:   '#5a7a5a',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
