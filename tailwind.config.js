/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#6366F1",
          "primary-focus": "#4F46E5",
          "primary-content": "#FFFFFF",
          "secondary": "#10B981",
          "secondary-focus": "#059669",
          "secondary-content": "#FFFFFF",
          "accent": "#EC4899",
          "accent-focus": "#DB2777",
          "accent-content": "#FFFFFF",
          "neutral": "#374151",
          "neutral-focus": "#1F2937",
          "neutral-content": "#FFFFFF",
          "base-100": "#111827",
          "base-200": "#1F2937",
          "base-300": "#374151",
          "base-content": "#F9FAFB",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
    ],
  },
};
