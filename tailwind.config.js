/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.json"
  ],

  // 🔥 Let the library control styles
  safelist: [
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^border-/ },
    { pattern: /^hover:bg-/ },
    { pattern: /^hover:text-/ },
    { pattern: /^hover:border-/ },
  ],

  theme: {
    extend: {},
  },

  plugins: [],
};
