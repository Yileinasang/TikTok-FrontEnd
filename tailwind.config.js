/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff0050',
        secondary: '#262626',
        'gray-100': '#f5f5f5',
        'gray-200': '#e5e5e5',
        'gray-300': '#d4d4d4',
        'gray-400': '#a3a3a3',
        'gray-500': '#737373',
        'gray-600': '#525252',
        'gray-700': '#404040',
        'gray-800': '#262626',
        'gray-900': '#171717',
        // Semi Design暗色模式CSS变量
        'semi-bg-0': 'var(--semi-color-bg-0)',
        'semi-bg-1': 'var(--semi-color-bg-1)',
        'semi-bg-2': 'var(--semi-color-bg-2)',
        'semi-text-0': 'var(--semi-color-text-0)',
        'semi-text-1': 'var(--semi-color-text-1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
