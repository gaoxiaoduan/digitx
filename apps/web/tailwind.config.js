/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        canvas: '#ffffff',
        'canvas-soft': '#fafafa',
        'canvas-soft-2': '#f5f5f5',
        hairline: '#ebebeb',
        'hairline-strong': '#a1a1a1',
        brand: {
          blue: '#0070f3',
          teal: '#50e3c2',
          pink: '#ff0080',
          violet: '#7928ca'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace']
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
        pill: '100px'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
