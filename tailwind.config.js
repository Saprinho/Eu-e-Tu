/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        roxo: '#7C3AED',
        azul: '#2563EB',
        rosa: '#EC4899',
        escuro: '#1F2937',
      },
    },
  },
  plugins: [],
}
