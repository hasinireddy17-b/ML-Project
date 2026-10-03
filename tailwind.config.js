export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FBF8F3', 50: '#FDFBF7', 100: '#F6F1E8', 200: '#EDE6DA', 300: '#E2D8C8' },
        surface: '#FFFDF9',
        sage: {
          50: '#F0F3EE', 100: '#E1E8DD', 200: '#C7D3C1', 300: '#A9BAA2', 400: '#8AA083',
          500: '#6F876A', 600: '#5B7257', 700: '#4A5E47', 800: '#3A4A38', 900: '#2C382A',
        },
        taupe: {
          50: '#F6F2EE', 100: '#ECE4DB', 200: '#DCCFC1', 300: '#C6B5A3', 400: '#AC9784',
          500: '#917C68', 600: '#76634F', 700: '#5E4F40',
        },
        ink: { DEFAULT: '#2A241F', soft: '#554B42', muted: '#74685E', faint: '#A39788' },
        line: { DEFAULT: '#E7DFD3', strong: '#D5CABB' },
        rust: { 50: '#F8ECE6', 500: '#A9563B', 600: '#8E4630' },
        amber: { 50: '#F7F0DF', 500: '#A87B2A', 600: '#8A6320' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42, 36, 31, 0.04), 0 2px 8px rgba(42, 36, 31, 0.04)',
        lift: '0 8px 30px rgba(42, 36, 31, 0.10)',
      },
    },
  },
};
