/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B46C1', // Deep purple
          hover: '#553C9A',
        },
        secondary: {
          DEFAULT: '#3B82F6', // Electric blue
          hover: '#2563EB',
        },
        background: '#F3F4F6', // Light gray
        surface: '#FFFFFF',
        text: '#1F2937', // Dark gray
      }
    },
  },
  plugins: [],
}
