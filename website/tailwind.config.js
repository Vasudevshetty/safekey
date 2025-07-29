/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            h1: {
              color: '#0f172a',
            },
            h2: {
              color: '#1e293b',
            },
            h3: {
              color: '#334155',
            },
            code: {
              color: '#e11d48',
              backgroundColor: '#f1f5f9',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: '#cbd5e1',
            h1: {
              color: '#f8fafc',
            },
            h2: {
              color: '#e2e8f0',
            },
            h3: {
              color: '#cbd5e1',
            },
            code: {
              color: '#fbbf24',
              backgroundColor: '#1e293b',
            },
            strong: {
              color: '#f1f5f9',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
