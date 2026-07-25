/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#1b4332',
        'evergreen': '#2d6a4f',
        'sandstone': '#e8ded0',
        'mountain-gray': '#6b7280',
        'warm-white': '#faf7f2',
        'soft-gold': '#c9a15c',
        'lake-blue': '#4a7c96'
      }
    }
  },
  plugins: []
};
