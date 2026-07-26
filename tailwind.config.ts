/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#14284B',
        'navy-hover': '#1e3a6d',
        'bg-app': '#F4F7FB',
        'panel': '#FFFFFF',
        'border-light': '#E2E8F0',
        'border-dark': '#CBD5E1',
        'text-main': '#1A2333',
        'text-muted': '#64748B',
        'primary-button': '#14284B',
        'secondary-button-bg': '#FFFFFF',
        'secondary-button-text': '#14284B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Segoe UI Mono"', 'monospace'],
      },
      boxShadow: {
        'inner': 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
