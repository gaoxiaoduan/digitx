/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        available: 'rgb(var(--available) / <alpha-value>)',
        registered: 'rgb(var(--registered) / <alpha-value>)',
        pending: 'rgb(var(--pending) / <alpha-value>)',
        score: 'rgb(var(--score) / <alpha-value>)',
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
      },
      boxShadow: {
        surface: '0 1px 1px rgb(0 0 0 / 0.03), 0 2px 4px rgb(0 0 0 / 0.04), inset 0 0 0 1px rgb(0 0 0 / 0.04)',
        floating: '0 2px 2px rgb(0 0 0 / 0.04), 0 8px 16px -4px rgb(0 0 0 / 0.08), inset 0 0 0 1px rgb(0 0 0 / 0.04)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
